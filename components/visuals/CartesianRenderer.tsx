// components/visuals/CartesianRenderer.tsx
"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Point { x: number; y: number; }

export default function CartesianRenderer({ schema }: { schema?: any }) {
  const defaultA: Point = schema?.data_spec?.A ?? { x: -3, y: 4 };
  const defaultB: Point = schema?.data_spec?.B ?? { x: 5, y: -2 };

  const [A, setA] = useState<Point>(defaultA);
  const [B, setB] = useState<Point>(defaultB);
  const [precision] = useState<number>(2);

  const dx = useMemo(() => B.x - A.x, [A, B]);
  const dy = useMemo(() => B.y - A.y, [A, B]);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midpoint = useMemo(() => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }), [A, B]);

  const traceLine = {
    x: [A.x, B.x],
    y: [A.y, B.y],
    mode: "lines+markers+text",
    type: "scatter" as const,
    marker: { size: 8 },
    text: [`A(${A.x}, ${A.y})`, `B(${B.x}, ${B.y})`],
    textposition: "top center",
    line: { width: 2 },
  };

  const traceMid = {
    x: [midpoint.x],
    y: [midpoint.y],
    mode: "markers+text",
    type: "scatter" as const,
    marker: { size: 9, symbol: "star" },
    text: [`M(${midpoint.x.toFixed(precision)}, ${midpoint.y.toFixed(precision)})`],
    textposition: "bottom center",
  };

  return (
    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 h-full">
      {/* Controls (compact) */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2">
          <input
            className="w-14 px-2 py-1 rounded bg-white text-black text-sm"
            type="number"
            value={A.x}
            onChange={(e) => setA({ ...A, x: Number(e.target.value) })}
          />
          <input
            className="w-14 px-2 py-1 rounded bg-white text-black text-sm"
            type="number"
            value={A.y}
            onChange={(e) => setA({ ...A, y: Number(e.target.value) })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            className="w-14 px-2 py-1 rounded bg-white text-black text-sm"
            type="number"
            value={B.x}
            onChange={(e) => setB({ ...B, x: Number(e.target.value) })}
          />
          <input
            className="w-14 px-2 py-1 rounded bg-white text-black text-sm"
            type="number"
            value={B.y}
            onChange={(e) => setB({ ...B, y: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Plot area: responsive height */}
      <div className="w-full h-[220px] sm:h-[340px] md:h-[520px]">
        <Plot
          data={[traceLine, traceMid]}
          layout={{
            autosize: true,
            margin: { l: 40, r: 12, t: 12, b: 36 },
            xaxis: { zeroline: true, dtick: 1 },
            yaxis: { zeroline: true, dtick: 1 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#e6edf3" },
          }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />
      </div>

      {/* Stats */}
      <div className="mt-3 text-xs sm:text-sm text-gray-300">
        <div>dx: <span className="font-semibold">{dx.toFixed(precision)}</span></div>
        <div>dy: <span className="font-semibold">{dy.toFixed(precision)}</span></div>
        <div>Distance: <span className="font-semibold">{distance.toFixed(precision)}</span></div>
      </div>
    </div>
  );
}
