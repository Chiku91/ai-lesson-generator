// pages/lessons/[id].tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/supabaseClient";
import VisualHost from "@/components/visuals/VisualHost";
import ReactMarkdown from "react-markdown";

export default function LessonPage() {
  const router = useRouter();
  const { id } = router.query;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(true);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function fetchLesson() {
      const { data, error } = await supabase
        .from("lessons_v3")
        .select("*")
        .eq("id", String(id))
        .single();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setLesson(data);
      setLoading(false);

      // Auto switch after 15 seconds
      const timer = setTimeout(() => setShowCode(false), 15000);

      return () => clearTimeout(timer);
    }

    fetchLesson();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        Loading lesson...
      </div>
    );
  }

  if (!lesson) {
    return <div className="p-10 text-red-400">Lesson not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 p-6">
        
        {/* LEFT SECTION — TEXTUAL EXPLANATION */}
        <div className="col-span-7">
          <button
            className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
            onClick={() => router.push("/")}
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold text-indigo-400 mb-4">
            {lesson.title}
          </h1>

          <section className="bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-800 h-[78vh] overflow-y-auto">

            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              💡 Concept Explanation
            </h2>

            <div className="prose prose-invert prose-lg leading-relaxed">
              <ReactMarkdown>
                {String(lesson.textual_explanation ?? "No explanation provided.")}
              </ReactMarkdown>
            </div>

            <hr className="my-6 border-gray-800" />

            <div className="text-sm text-gray-400">
              <strong>Key Takeaways</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Understand the concept clearly</li>
                <li>Explore interactive visualizations</li>
                <li>Learn step-by-step through examples</li>
                <li>Strengthen conceptual understanding</li>
              </ul>
            </div>
          </section>
        </div>

        {/* RIGHT SECTION — CODE + VISUALIZATION */}
        <div className="col-span-5">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">
            Interactive Visualization
          </h2>

          {/* 🔥 Button Controls */}
          <div className="mb-4 flex gap-3">
            {showCode ? (
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white"
                onClick={() => setShowCode(false)}
              >
                🚀 Show Visualization Now
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white"
                onClick={() => setShowCode(true)}
              >
                🔄 Back to Code
              </button>
            )}
          </div>

          <div className="bg-white/5 p-4 rounded-lg border border-gray-800 h-[78vh] overflow-y-auto">
            {showCode ? (
              <pre className="bg-gray-900 text-green-300 p-4 rounded-lg h-full overflow-auto">
                {lesson.generated_code ?? "No generated code available."}
              </pre>
            ) : (
              <VisualHost schema={lesson.visualization_schema} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
