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
}

export default function QuizRenderer({ schema }: { schema?: QuizSchema }) {
  const questions: QuizQuestion[] = schema?.data_spec?.questions ?? [];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const safeSetAnswer = (i: number, opt: string) => setAnswers((s) => ({ ...s, [i]: opt }));
  const submit = (i: number) => setChecked((s) => ({ ...s, [i]: true }));

  return (
    <div className="p-2 min-h-[200px]">
      {schema?.explanatory_markup ? (
        <div className="mb-3 bg-white/5 p-3 rounded border border-gray-800 text-sm">
          <div className="font-semibold text-xs text-gray-200 mb-1">Explanation</div>
          <div className="prose prose-sm prose-invert text-xs">
            <ReactMarkdown>{String(schema.explanatory_markup)}</ReactMarkdown>
          </div>
        </div>
      ) : null}

      {questions.length === 0 ? (
        <div className="p-2 text-sm text-gray-400">No quiz available</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q: QuizQuestion, i: number) => (
            <div key={i} className="bg-white/3 p-3 rounded-lg border border-gray-700">
              <div className="font-semibold text-sm mb-2">{i + 1}. {q.q || "Untitled Question"}</div>
              <div className="space-y-2">
                {(q.options ?? []).map((opt: string, idx: number) => (
                  <label key={idx} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${checked[i] && q.answer === opt ? "ring-2 ring-green-400/40" : ""}`}>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => safeSetAnswer(i, opt)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm">{opt || "Empty option"}</span>
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
                      <span className="text-red-400">Wrong — correct: <span className="font-medium text-white/90 px-2 rounded bg-gray-800">{q.answer}</span></span>
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
