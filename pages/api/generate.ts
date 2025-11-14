// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { serverSupabase } from "@/lib/supabase/serverSupabase";
import ts from "typescript";
import {
  startTracingRun,
  endTracingRun,
  endTracingRunError,
} from "@/lib/tracedLLm";

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
// SYSTEM PROMPT
// ----------------------------------------------------
const SYSTEM_PROMPT = `
You must return STRICT JSON ONLY:

{
  "explanation": "LONG structured markdown (900–1300 words)",
  "tsx": "export default function LessonViz(props: LessonVizProps) { ... }",
  "visualization_type": "...",
  "visualization_schema": { ... }
}

--- TRIMMED FOR BREVITY (same as your version) ---
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
          caption: "AI fallback image",
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
  console.log("\n==============================================");
  console.log("🚀 NEW LESSON GENERATION STARTED");
  console.log("==============================================\n");

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { outline } = req.body;

  console.log("📘 Topic Received:", outline);

  if (!outline?.trim())
    return res.status(400).json({ error: "Outline required" });

  // --------------------------------------------------------
  // CREATE ROOT TRACING RUN
  // --------------------------------------------------------
  const rootRunId = await startTracingRun("Generate Lesson", { outline });
  console.log("🔷 LangSmith Root Run:", rootRunId);

  try {
    // Insert placeholder Supabase row
    const { data: inserted } = await serverSupabase
      .from("lessons_v3")
      .insert({ outline, status: "generating" })
      .select()
      .single();

    const lessonId = inserted.id;
    const topic = outline.toLowerCase();

    console.log("🗂 DB placeholder saved:", lessonId);

    const wantsImages =
      topic.includes("image") ||
      topic.includes("images") ||
      topic.includes("picture") ||
      topic.includes("pictures") ||
      topic.includes("photos");

    // --------------------------------------------------------
    // SUB-FUNCTION: CALL AI WITH TRACING
    // --------------------------------------------------------
    async function callAI() {
      const aiRunId = await startTracingRun("OpenAI Call", { topic });
      console.log("🤖 LangSmith → Sub Run for OpenAI:", aiRunId);

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Topic: ${outline}` },
          ],
          temperature: 0.2,
          max_tokens: 5000,
        });

        const output = completion.choices[0].message?.content ?? "";

        await endTracingRun(aiRunId, output);
        return output;

      } catch (err) {
        await endTracingRunError(aiRunId, err);
        throw err;
      }
    }

    // --------------------------------------------------------
    // START MULTIPLE ATTEMPTS
    // --------------------------------------------------------
    console.log("\n🔁 Starting TSX generation attempts...\n");

    let final: any = null;

    for (let attempt = 1; attempt <= 6; attempt++) {
      console.log(`---------------- Attempt ${attempt} ----------------`);

      const attemptRunId = await startTracingRun(
        `Attempt ${attempt}`,
        { outline }
      );
      console.log("🔸 LangSmith Attempt Run:", attemptRunId);

      try {
        let raw: string = await callAI();

        // JSON extraction
        let parsed: any = null;
        try {
          parsed = JSON.parse(raw.trim());
        } catch {
          console.log("❌ JSON parse failed — trying rescue parse.");
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
          console.log("⚠ Invalid JSON → retrying...\n");
          await endTracingRunError(attemptRunId, "Invalid JSON response");
          continue;
        }

        // Force image mode when needed
        if (wantsImages) {
          parsed.visualization_type = "image";

          const imgs = parsed?.visualization_schema?.data_spec?.images;
          if (!imgs || !Array.isArray(imgs) || imgs.length === 0) {
            parsed.visualization_schema = fallbackImages(outline);
          }
        }

        // TSX VALIDATION
        console.log("🧪 Validating TSX...");
        const v = validateTSX(parsed.tsx);

        if (!v.ok) {
          console.log("❌ TSX INVALID\n", v.errors);
          await endTracingRunError(attemptRunId, v.errors);
          continue;
        }

        console.log("🎉 TSX VALID on attempt", attempt);

        await endTracingRun(attemptRunId, parsed);
        final = parsed;
        break;

      } catch (err) {
        console.log("❌ Attempt failed:", err);
        await endTracingRunError(attemptRunId, err);
      }
    }

    // --------------------------------------------------------
    // FAILURE AFTER ALL ATTEMPTS
    // --------------------------------------------------------
    if (!final) {
      console.log("❌ ALL ATTEMPTS FAILED — MARKING FAILED");

      await serverSupabase
        .from("lessons_v3")
        .update({ status: "failed" })
        .eq("id", lessonId);

      await endTracingRunError(rootRunId, "All TSX attempts failed");

      return res.status(500).json({ error: "AI generation failed" });
    }

    // --------------------------------------------------------
    // SAVE FINAL DATA
    // --------------------------------------------------------
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
    await endTracingRun(rootRunId, { success: lessonId });

    return res.status(200).json({ id: lessonId });

  } catch (err) {
    console.log("🔥 FATAL ERROR:", err);
    await endTracingRunError(rootRunId, err);
    return res.status(500).json({ error: "Fatal error" });
  }
}
