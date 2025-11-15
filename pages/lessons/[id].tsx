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
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm"
          onClick={() => router.push("/")}
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-400 mb-6">
          {lesson.title}
        </h1>

        {/* Layout: column on mobile, two columns on md+ */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Explanation (left on desktop) */}
          <div className="w-full md:w-7/12 bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl sm:text-2xl font-semibold text-yellow-400 mb-4">
              💡 Concept Explanation
            </h2>

            <div className="prose prose-invert prose-sm sm:prose-base leading-relaxed text-sm sm:text-base">
              <ReactMarkdown>
                {String(lesson.textual_explanation ?? "No explanation provided.")}
              </ReactMarkdown>
            </div>

            <hr className="my-6 border-gray-800" />

            <div className="text-xs sm:text-sm text-gray-400">
              <strong>Key Takeaways</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Understand the concept clearly</li>
                <li>Explore interactive visualizations</li>
                <li>Learn step-by-step through examples</li>
                <li>Strengthen conceptual understanding</li>
              </ul>
            </div>
          </div>

          {/* Visualization (right on desktop) */}
          <div className="w-full md:w-5/12 bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-300 mb-4">
              Interactive Visualization
            </h2>

            {/* Visualization container:
                - mobile: small height
                - md+ (desktop): normal height ~ 420-600 (use md:min-h-520 for normal)
            */}
            <div className="w-full min-h-[260px] sm:min-h-[320px] md:min-h-[520px]">
              <VisualHost schema={lesson.visualization_schema} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
