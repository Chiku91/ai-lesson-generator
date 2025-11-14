// components/visuals/QuizRenderer.tsx
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer?: string;
}

export interface QuizSchema {
  type?: string;
  data_spec?: {
    questions?: QuizQuestion[];
  };
  explanatory_markup?: string | null;
  // optional layout etc.
}

export default function QuizRenderer({ schema }: { schema?: QuizSchema }) {
  const questions: QuizQuestion[] = schema?.data_spec?.questions ?? [];
  // state of chosen answers per question index
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // which questions were checked (show result)
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const safeSetAnswer = (i: number, opt: string) => {
    setAnswers((s) => ({ ...s, [i]: opt }));
  };

  const submit = (i: number) => {
    setChecked((s) => ({ ...s, [i]: true }));
  };

  return (
    <div>
      {/* Explanation area (render markdown if present) */}
      {schema?.explanatory_markup ? (
        <div className="mb-4 bg-white/5 p-4 rounded-md border border-gray-800">
          <div className="text-sm text-gray-200 mb-2 font-semibold">Explanation</div>
          <div className="prose prose-sm prose-invert text-sm">
            <ReactMarkdown>{String(schema.explanatory_markup)}</ReactMarkdown>
          </div>
        </div>
      ) : null}

      {/* Questions area */}
      {questions.length === 0 ? (
        <div className="p-4 text-gray-500">No quiz available</div>
      ) : (
        <div className="space-y-6">
          {questions.map((q: QuizQuestion, i: number) => (
            <div key={i} className="bg-white/5 p-4 rounded-lg border border-gray-800">
              <div className="font-semibold text-gray-100 mb-3">{i + 1}. {q.q || "Untitled Question"}</div>

              <div className="space-y-2">
                {(q.options ?? []).map((opt: string, idx: number) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer bg-white/3 hover:bg-white/5 ${checked[i] && q.answer === opt ? "ring-2 ring-green-400/40" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => safeSetAnswer(i, opt)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-gray-900 bg-white/90 px-3 py-2 rounded-md w-full">{opt || "Empty option"}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-4">
                <button onClick={() => submit(i)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Check</button>
                {checked[i] && (
                  <div className="text-sm">
                    {answers[i] === q.answer ? (
                      <span className="text-green-400 font-semibold">Correct ✅</span>
                    ) : (
                      <span className="text-red-400">Wrong — correct: <span className="font-medium text-gray-900 bg-white/90 px-2 rounded">{q.answer}</span></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
