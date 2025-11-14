// pages/api/visualize.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { title, explanation, intent } = req.body;

  if (!title || !explanation) {
    return res.status(400).json({ error: "Missing title or explanation" });
  }

  const prompt = (retry = false) => `
You are an **AI Educational Visualization Generator**.
Your job is to create **interactive, topic-relevant visuals** that best explain the given concept to students.

Input Title: "${title}"
Intent: "${intent}"
Explanation Summary: ${explanation.slice(0, 800)}

Output Requirements (JSON only, no markdown fences):

{
  "type": "plotly | flow | cartesian | map | image | quiz",
  "description": "short summary of what this visualization shows",
  "data_spec": {...},
  "controls": [],
  "layout": { "title": "Visual representation of ${title}", "width": 720, "height": 400 },
  "explanatory_markup": "markdown explaining how to interpret the visual"
}

Rules:
- NEVER return empty visuals.
- If the topic is abstract (e.g., AI, leadership, history), use a **flow diagram** or **conceptual image** that shows relationships or processes.
- For mathematical or scientific concepts, use **plotly** or **cartesian**.
- For geography or real-world entities, use **map**.
- For quiz-based lessons, use **quiz** with questions in data_spec.questions[].
- Always include meaningful sample data inside data_spec to visualize something relevant.
- Avoid empty arrays or nulls.
- If you are unsure, create a conceptual flow diagram showing inputs → processes → outputs related to the topic.
- You MUST produce valid JSON only.
${retry ? "Previous attempt was invalid or missing visualization. Try again with a clearer, more detailed schema and complete data_spec." : ""}
`;

  async function generateVisual(retry = false): Promise<any> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 🔥 most accurate model
      messages: [{ role: "user", content: prompt(retry) }],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = (completion.choices[0]?.message?.content || "")
      .replace(/```json|```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(content);
      if (!parsed.type || !parsed.data_spec) throw new Error("Missing required fields");
      return parsed;
    } catch (err) {
      if (!retry) {
        console.warn("⚠️ Visualization invalid. Retrying...");
        return generateVisual(true);
      } else {
        console.error("❌ Visualization generation failed twice:", err);
        // Fallback: Generate a flow diagram always
        return {
          type: "flow",
          description: "Fallback conceptual flow for topic understanding",
          data_spec: {
            nodes: [
              { id: 1, label: "Concept Input" },
              { id: 2, label: "Process / Transformation" },
              { id: 3, label: "Output / Application" },
            ],
            edges: [
              { from: 1, to: 2 },
              { from: 2, to: 3 },
            ],
          },
          layout: { title: `Conceptual flow for ${title}`, width: 700, height: 400 },
          explanatory_markup:
            "This flow shows a conceptual understanding of how inputs transform into outcomes for this topic.",
        };
      }
    }
  }

  try {
    const visualSchema = await generateVisual();
    return res.status(200).json({ schema: visualSchema });
  } catch (err: any) {
    console.error("Visual generation error:", err);
    return res.status(500).json({ error: String(err) });
  }
}
