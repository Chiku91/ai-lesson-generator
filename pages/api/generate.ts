// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { serverSupabase } from "@/lib/supabase/serverSupabase";
import ts from "typescript";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Helicone Logger
// ---------------------------------------------------------------------------
async function heliconeLog(payload: any) {
  if (!process.env.HELICONE_API_KEY) return;

  try {
    await fetch("https://api.helicone.ai/v1/trace/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HELICONE_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {}
}

// ---------------------------------------------------------------------------
// OpenAI via Helicone Gateway
// ---------------------------------------------------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://oai.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

// ---------------------------------------------------------------------------
// TSX Validator
// ---------------------------------------------------------------------------
function validateTSX(code: string) {
  const out = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2017,
      skipLibCheck: true,
    },
    reportDiagnostics: true,
  });

  const errors =
    out.diagnostics?.map((d) =>
      ts.flattenDiagnosticMessageText(d.messageText, "\n")
    ) ?? [];

  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// **NEW FIXED SYSTEM PROMPT** — Guarantees correct visualization_type
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `
You must ALWAYS return **exactly one JSON object**.  
If you violate ANY rule, return ONLY:
{ "error": "FORMAT_ERROR" }

Your JSON must follow EXACT schema:

{
  "explanation": "string (900-1300 words, markdown allowed)",
  "tsx": "string (valid TSX: must contain interface LessonVizProps { topic: string } AND export default function LessonViz(props: LessonVizProps))",
  "visualization_type": "flow" | "quiz" | "image" | "cartesian",
  "visualization_schema": {}
}

STRICT RULES (follow EXACTLY):

1. NEVER output text outside JSON.
2. NO markdown outside JSON strings.
3. visualization_type MUST be EXACTLY one of:
   - "cartesian"
   - "image"
   - "flow"
   - "quiz"

4. Mandatory Classification Rules:
   If topic contains ANY of:
     "cartesian", "coordinate", "distance", "midpoint", "graph", "plot", "points"
     → visualization_type = "cartesian"

   If topic contains:
     "image", "images", "picture", "pictures", "photos"
     → visualization_type = "image"

   If topic contains:
     "flowchart", "steps", "workflow", "process"
     → visualization_type = "flow"

   If topic contains:
     "quiz", "mcq", "test", "questions"
     → visualization_type = "quiz"

5. visualization_schema rules:

   For "cartesian":
   {
     "type": "cartesian",
     "data_spec": {
       "A": { "x": number, "y": number },
       "B": { "x": number, "y": number }
     },
     "layout": { "width": 420, "height": 380 }
   }

   For "image":
   {
     "type": "image",
     "data_spec": {
       "images": [
         { "src": "string", "title": "string", "caption": "string", "alt": "string" }
       ]
     },
     "explanatory_markup": "string"
   }

   For "quiz":
   {
     "type": "quiz",
     "data_spec": {
       "questions": [
         { "q": "string", "options": ["A","B","C","D"], "answer": "A" }
       ]
     }
   }

   For "flow":
   {
     "type": "flow",
     "data_spec": {
       "nodes": [
         { "id": "string", "label": "string", "description": "string" }
       ],
       "edges": [
         ["a","b"]
       ]
     }
   }
`;

// ---------------------------------------------------------------------------
// Fallback image
// ---------------------------------------------------------------------------
function fallbackImages(topic: string) {
  return {
    type: "image",
    data_spec: {
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/3/32/Plant_cell_structure.png",
          title: `${topic} — Diagram`,
          caption: "Fallback image",
          alt: `${topic} diagram`,
        },
      ],
    },
    explanatory_markup: "<p>Fallback image applied.</p>",
  };
}

// ---------------------------------------------------------------------------
// MAIN HANDLER
// ---------------------------------------------------------------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔥 Helicone Key:", !!process.env.HELICONE_API_KEY);
  console.log("🔥 OpenAI Key:", !!process.env.OPENAI_API_KEY);

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { outline } = req.body;
  if (!outline) return res.status(400).json({ error: "Outline required" });

  const topic = outline.toLowerCase();

  // Insert placeholder into DB
  const { data: inserted } = await serverSupabase
    .from("lessons_v3")
    .insert({ outline, status: "generating" })
    .select()
    .single();

  const lessonId = inserted.id;
  const sessionId = randomUUID();

  await heliconeLog({
    type: "session_start",
    session_id: sessionId,
    outline,
    lessonId,
  });

  // Image rule
  const wantsImages =
    topic.includes("image") ||
    topic.includes("images") ||
    topic.includes("picture") ||
    topic.includes("pictures") ||
    topic.includes("photos");

  // -----------------------------------------------------------------------
  // LLM CALL
  // -----------------------------------------------------------------------
  async function callAI() {
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Topic: ${outline}` },
        ],
        max_tokens: 5000,
        temperature: 0.2,
      },
      {
        headers: {
          "Helicone-Session-Id": sessionId,
          "Helicone-Property-LessonId": String(lessonId),
          "Helicone-Property-Topic": outline,
        },
      }
    );

    const content = completion.choices[0].message?.content ?? "";
    console.log("📩 RAW:", content.slice(0, 500));
    return content;
  }

  // -----------------------------------------------------------------------
  // MULTI-ATTEMPT GENERATION
  // -----------------------------------------------------------------------
  let final: any = null;

  for (let attempt = 1; attempt <= 6; attempt++) {
    console.log(`\n⚡ Attempt ${attempt}`);

    const raw = await callAI();
    console.log("RAW:", raw.slice(0, 500));

    let parsed = null;

    // JSON parse attempt
    try {
      parsed = JSON.parse(raw.trim());
      console.log("✅ Parsed normally");
    } catch {
      console.log("❌ Normal parse failed");
      const m = raw.match(/\{[\s\S]*\}$/m);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
          console.log("🛟 Rescue parse OK");
        } catch {
          console.log("❌ Rescue parse failed");
        }
      }
    }

    if (!parsed) continue;

    // ---- FIX: Force image fallback ----
    if (wantsImages) {
      parsed.visualization_type = "image";

      if (!parsed.visualization_schema?.data_spec?.images) {
        parsed.visualization_schema = fallbackImages(outline);
      }
    }

    // ---- FIX: Validate TSX ----
    const v = validateTSX(parsed.tsx);
    console.log("TSX Validation:", v);
    if (!v.ok) continue;

    final = parsed;
    break;
  }

  // -----------------------------------------------------------------------
  // FAILURE
  // -----------------------------------------------------------------------
  if (!final) {
    await serverSupabase
      .from("lessons_v3")
      .update({ status: "failed" })
      .eq("id", lessonId);

    return res.status(500).json({ error: "AI generation failed" });
  }

  // -----------------------------------------------------------------------
  // SAVE SUCCESSFUL RESULT
  // -----------------------------------------------------------------------
  await serverSupabase
    .from("lessons_v3")
    .update({
      title: outline,
      textual_explanation: final.explanation,
      generated_code: final.tsx,
      visualization_type: final.visualization_type,
      visualization_schema: final.visualization_schema,
      status: "generated",
    })
    .eq("id", lessonId);

  return res.status(200).json({ id: lessonId, session_id: sessionId });
}
