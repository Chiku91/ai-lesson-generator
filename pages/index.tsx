// pages/index.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/supabaseClient";

interface Lesson {
  id: string;
  title?: string;
  outline?: string;
  status?: string;
  created_at?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function fetchLessons() {
    const { data, error } = await supabase
      .from("lessons_v3")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setLessons((data as Lesson[]) ?? []);
  }

  useEffect(() => {
    fetchLessons();
    const id = setInterval(fetchLessons, 8000);
    return () => clearInterval(id);
  }, []);

  const handleGenerate = async () => {
    if (!outline.trim()) {
      alert("Please enter a topic.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("🧠 Sending request to AI model...");

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline }),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Generation failed");

      const lessonId = json.id;
      setStatusMessage("✨ Waiting for AI to finish generating...");

      const poll = setInterval(async () => {
        const { data: row, error } = await supabase
          .from("lessons_v3")
          .select("status")
          .eq("id", lessonId)
          .single<Lesson>();

        if (error) {
          clearInterval(poll);
          setIsGenerating(false);
          setStatusMessage("❌ Polling error");
          return;
        }

        if (row?.status === "generated") {
          clearInterval(poll);
          setIsGenerating(false);
          setStatusMessage("✅ Generated! Redirecting...");
          router.push(`/lessons/${lessonId}`);
        } else if (row?.status === "failed") {
          clearInterval(poll);
          setIsGenerating(false);
          setStatusMessage("❌ Failed. Check server logs.");
        }
      }, 3000);
    } catch (err) {
      setIsGenerating(false);
      setStatusMessage("❌ Error sending request. Check server logs.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-indigo-400 text-center">
          🤖🔮🧠 EduNova AI
        </h1>

        <div className="bg-gray-900 p-4 sm:p-5 rounded-xl mb-6 border border-gray-800">
          <label className="block text-base sm:text-lg mb-2">Enter a topic</label>

          <textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 p-3 rounded text-gray-100 text-sm sm:text-base"
            placeholder="e.g., Cartesian plane distance"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full mt-3 py-3 rounded-lg font-semibold text-sm sm:text-base ${
              isGenerating
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {isGenerating ? "⏳ Generating..." : "🚀 Generate Lesson"}
          </button>

          {statusMessage && (
            <p className="mt-2 text-xs sm:text-sm text-indigo-300">{statusMessage}</p>
          )}
        </div>

        <div className="bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-800 overflow-x-auto">
          <h2 className="text-xl sm:text-2xl text-indigo-300 mb-3 text-center sm:text-left">
            Previously generated
          </h2>

          {lessons.length === 0 ? (
            <div className="text-gray-500 italic text-center">No lessons yet</div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="text-indigo-400 border-b border-gray-800">
                  <th className="p-2">Lesson</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Created</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="border-b border-gray-800 hover:bg-gray-800/40"
                  >
                    <td className="p-2 truncate max-w-[160px] sm:max-w-none">
                      {lesson.title ?? lesson.outline ?? "(untitled)"}
                    </td>

                    <td className="p-2">
                      {lesson.status === "generated" ? (
                        <span className="text-green-400">✅ Generated</span>
                      ) : lesson.status === "failed" ? (
                        <span className="text-red-400">❌ Failed</span>
                      ) : (
                        <span className="text-yellow-400">⏳ Generating...</span>
                      )}
                    </td>

                    <td className="p-2 text-gray-400">{lesson.created_at ?? "—"}</td>

                    <td className="p-2 text-right">
                      {lesson.status === "generated" ? (
                        <button
                          onClick={() => router.push(`/lessons/${lesson.id}`)}
                          className="bg-indigo-600 px-3 py-1 rounded text-white text-xs sm:text-sm"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}