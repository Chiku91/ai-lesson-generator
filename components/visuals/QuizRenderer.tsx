// components/visuals/QuizRenderer.tsx
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function QuizRenderer({ schema }: { schema?: any }) {
  const questions = schema?.data_spec?.questions ?? [];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const safeSetAnswer = (i: number, opt: string) => setAnswers((s) => ({ ...s, [i]: opt }));
  const submit = (i: number) => setChecked((s) => ({ ...s, [i]: true }));

  if (questions.length === 0) {
    return <div className="p-3 text-sm text-gray-400">No quiz available</div>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q: any, i: number) => (
        <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800">
          {q.q && <div className="font-semibold text-sm md:text-base mb-2">{i + 1}. <ReactMarkdown>{q.q}</ReactMarkdown></div>}
          <div className="space-y-2">
            {(q.options ?? []).map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-3 p-2 rounded-md cursor-pointer bg-white/3">
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={opt}
                  checked={answers[i] === opt}
                  onChange={() => safeSetAnswer(i, opt)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm md:text-base">{opt || "Empty option"}</span>
              </label>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => submit(i)} className="px-3 py-1 bg-indigo-600 text-white rounded">Check</button>
            {checked[i] && (
              <div className="text-sm">
                {answers[i] === q.answer ? (
                  <span className="text-green-400 font-semibold">Correct ✅</span>
                ) : (
                  <span className="text-red-400">Wrong — correct: <span className="font-medium">{q.answer}</span></span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
