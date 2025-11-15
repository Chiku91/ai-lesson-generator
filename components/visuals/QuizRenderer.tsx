// components/visuals/QuizRenderer.tsx
"use client";

import React from "react";

export default function QuizRenderer({ schema }: { schema?: any }) {
  const questions = schema?.data_spec?.questions ?? [];

  return (
    <div className="space-y-4 text-sm">
      {questions.map((q: any, i: number) => (
        <div
          key={i}
          className="bg-gray-900 p-4 rounded-xl border border-gray-800"
        >
          <p className="font-semibold mb-2">{i + 1}. {q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt: string, idx: number) => (
              <div key={idx} className="bg-white/10 p-2 rounded">
                {opt}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
