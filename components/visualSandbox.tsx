// components/visualSandbox.tsx
"use client";
import React, { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import VisualHost from "./visuals/VisualHost";

export default function VisualSandbox({
  code,
  visualizationType,
  visualizationSchema,
}: {
  code: string;
  visualizationType?: string;
  visualizationSchema?: any;
}) {
  const [showCode, setShowCode] = useState<boolean>(Boolean(code));
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    if (!code) {
      setShowCode(false);
      setTimerDone(true);
      return;
    }
    setShowCode(true);
    setTimerDone(false);
    const t = setTimeout(() => {
      setShowCode(false);
      setTimerDone(true);
    }, 15000); // 15s
    return () => clearTimeout(t);
  }, [code]);

  if (!code && !visualizationType) {
    return <div className="p-6 text-center text-gray-600">⚠️ No visualization available for this topic.</div>;
  }

  return (
    <div>
      {showCode ? (
        <div className="bg-black text-green-300 p-4 rounded-md shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">GeneratedLesson.tsx</span>
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">AI GENERATED</span>
          </div>
          <div style={{ maxHeight: 440, overflow: "auto" }}>
            <SyntaxHighlighter language="tsx">{code}</SyntaxHighlighter>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setShowCode(false); setTimerDone(true); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Show Visual Now</button>
            <div className="text-xs text-gray-300 self-center">Code visible for 15s</div>
          </div>
        </div>
      ) : (
        <>
          {/* Render the visualization host (client components inside) */}
          <VisualHost schema={{ type: visualizationType, ...(visualizationSchema ?? {}) }} />
        </>
      )}
    </div>
  );
}
