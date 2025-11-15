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
    setStatusMessage("🧠 Sending request...");

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline }),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Generation failed");

      const lessonId = json.id;
      setStatusMessage("✨ Generating lesson...");

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
          setStatusMessage("✅ Done! Redirecting...");
          router.push(`/lessons/${lessonId}`);
        } else if (row?.status === "failed") {
          clearInterval(poll);
          setIsGenerating(false);
          setStatusMessage("❌ Failed");
        }
      }, 3000);
    } catch (err) {
      setIsGenerating(false);
      setStatusMessage("❌ Error. Check logs.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">

      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-400 text-center">
          🤖 EduNova AI
        </h1>

        {/* Input */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
          <label className="block text-base mb-1">Enter a topic</label>

          <textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 p-3 rounded text-gray-100 text-sm"
            placeholder="e.g., Cartesian plane distance"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-semibold ${
              isGenerating
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {isGenerating ? "⏳ Generating..." : "🚀 Generate Lesson"}
          </button>

          {statusMessage && (
            <p className="text-xs text-indigo-300">{statusMessage}</p>
          )}
        </div>

        {/* History */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 overflow-x-auto">
          <h2 className="text-xl text-indigo-300 mb-3">Previous lessons</h2>

          {lessons.length === 0 ? (
            <p className="text-gray-500 italic">No lessons yet</p>
          ) : (
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-indigo-300 border-b border-gray-800">
                <tr>
                  <th className="p-2">Title</th>
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
                    <td className="p-2">{lesson.title ?? lesson.outline}</td>
                    <td className="p-2">
                      {lesson.status === "generated" ? (
                        <span className="text-green-400">Done</span>
                      ) : lesson.status === "failed" ? (
                        <span className="text-red-400">Failed</span>
                      ) : (
                        <span className="text-yellow-400">Working...</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-400">{lesson.created_at}</td>
                    <td className="p-2 text-right">
                      {lesson.status === "generated" ? (
                        <button
                          onClick={() => router.push(`/lessons/${lesson.id}`)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs"
                        >
                          View
                        </button>
                      ) : (
                        "—"
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
