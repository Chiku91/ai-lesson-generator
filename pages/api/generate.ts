// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { serverSupabase } from "@/lib/supabase/serverSupabase";
import ts from "typescript";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ----------------------------------------------------
// TSX VALIDATOR
// ----------------------------------------------------
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

  const diagnostics = out.diagnostics ?? [];
  const errors = diagnostics.map((d) =>
    ts.flattenDiagnosticMessageText(d.messageText, "\n")
  );

  return { ok: errors.length === 0, errors };
}

// ----------------------------------------------------
// SYSTEM PROMPT (VERY STRICT)
// ----------------------------------------------------
const SYSTEM_PROMPT = `
You must return STRICT JSON ONLY:

{
  "explanation": "LONG structured markdown (900–1300 words)",
  "tsx": "export default function LessonViz(props: LessonVizProps) { ... }",
  "visualization_type": "...",
  "visualization_schema": { ... }
}

=====================================================
RULES FOR EXPLANATION:
=====================================================
- MINIMUM 900 words, MAXIMUM 1300.
- Use headings, subheadings, bullets, numbering.
- Use emojis (📘✨📌🧠🌱➡️).
- Include intro, breakdown, examples, deep explanation, key takeaways.

=====================================================
RULES FOR TSX:
=====================================================
- STRICT TSX ONLY.
- MUST contain: interface LessonVizProps { topic: string }
- Must EXPORT: export default function LessonViz(props: LessonVizProps)
- Everything fully typed.
- NO markdown inside TSX.

=====================================================
RULES FOR FLOW DIAGRAMS:
=====================================================
{
 "type": "flow",
 "data_spec": {
   "nodes": [{ "id": "", "label": "", "description": "" }],
   "edges": [["a","b"]]
 }
}

=====================================================
RULES FOR QUIZ:
=====================================================
{
 "type": "quiz",
 "data_spec": {
   "questions": [
     { "q":"", "options":["A","B","C","D"], "answer":"A" }
   ]
 }
}

=====================================================
RULES FOR IMAGE VISUALIZATION:
=====================================================
If topic mentions:
"using images", "with images", "using pictures", "photos"

Then MUST produce:

{
 "type": "image",
 "data_spec": {
   "images": [
     { "src":"", "title":"", "caption":"", "alt":"" }
   ]
 },
 "explanatory_markup": "<p>Explanation...</p>"
}

=====================================================
RULES FOR CARTESIAN VISUALS:
=====================================================
If topic contains:
"cartesian", "coordinate", "distance formula",
"midpoint", "plot points", "graph points"

Must output:

{
 "type": "cartesian",
 "data_spec": {
   "A": { "x": number, "y": number },
   "B": { "x": number, "y": number }
 },
 "layout": { "width":420, "height":380 }
}

=====================================================
FOLLOW RULES EXACTLY.
=====================================================
`;

// ----------------------------------------------------
// IMAGE FALLBACK
// ----------------------------------------------------
function fallbackImages(topic: string) {
  return {
    type: "image",
    data_spec: {
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Plant_cell_structure.png/640px-Plant_cell_structure.png",
          title: `${topic} — Diagram 1`,
          caption: "AI fallback image (auto-applied).",
          alt: `${topic} diagram`,
        },
      ],
    },
    explanatory_markup: "<p>AI fallback image applied.</p>",
  };
}

// ----------------------------------------------------
// MAIN HANDLER
// ----------------------------------------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("\n===========================================");
  console.log("🚀 NEW LESSON GENERATION STARTED");
  console.log("===========================================\n");

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { outline } = req.body;

  console.log("📘 Topic received:", outline);

  if (!outline?.trim())
    return res.status(400).json({ error: "Outline required" });

  // Insert placeholder row
  const { data: inserted } = await serverSupabase
    .from("lessons_v3")
    .insert({ outline, status: "generating" })
    .select()
    .single();

  const lessonId = inserted.id;
  const topic = outline.toLowerCase();

  console.log("🗂 Saved placeholder DB entry:", lessonId);

  const wantsImages =
    topic.includes("image") ||
    topic.includes("images") ||
    topic.includes("picture") ||
    topic.includes("pictures") ||
    topic.includes("photos");

  async function callAI() {
    console.log("🤖 Calling OpenAI model...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Topic: ${outline}` },
      ],
      temperature: 0.2,
      max_tokens: 5000,
    });
    return completion.choices[0].message?.content ?? "";
  }

  let final = null;

  console.log("\n🔁 Starting TSX generation attempts...\n");

  for (let attempt = 1; attempt <= 6; attempt++) {
    console.log(`---------------- Attempt ${attempt} ----------------`);

    let raw: string = await callAI();

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw.trim());
      
    } catch (e) {
      console.log("❌ JSON parse failed. Trying rescue parse...");
      const m = raw.match(/\{[\s\S]*\}$/m);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
          console.log("🛟 Rescue JSON parse successful.");
        } catch {
          console.log("❌ Rescue JSON parse failed.");
        }
      }
    }

    if (!parsed) {
      console.log("⚠ No valid JSON — retrying...\n");
      continue;
    }

    // Force image type when needed
    if (wantsImages) {
      console.log("🖼 Topic requires IMAGES. Overriding visualization_type → image");
      parsed.visualization_type = "image";

      const imgs = parsed?.visualization_schema?.data_spec?.images;
      if (!imgs || !Array.isArray(imgs) || imgs.length === 0) {
        console.log("⚠ No images generated — applying fallback image.");
        parsed.visualization_schema = fallbackImages(outline);
      }
    }

    // Validate TSX
    console.log("🧪 Validating TSX...");
    const v = validateTSX(parsed.tsx);

    if (!v.ok) {
      console.log("❌ TSX FAILED:");
      console.log(v.errors);
      console.log("⏳ Retrying...\n");
      continue;
    }

    console.log("🎉 TSX VALID! Generation successful on attempt", attempt);
    final = parsed;
    break;
  }

  if (!final) {
    console.log("❌ ALL ATTEMPTS FAILED — MARKING AS FAILED");
    await serverSupabase
      .from("lessons_v3")
      .update({ status: "failed" })
      .eq("id", lessonId);

    return res.status(500).json({ error: "AI generation failed" });
  }

  console.log("\n💾 Saving final lesson to database...");

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

  console.log("✅ LESSON SAVED SUCCESSFULLY!");
  console.log("📦 Returning lesson ID:", lessonId);
  console.log("===========================================\n");

  return res.status(200).json({ id: lessonId });
}
