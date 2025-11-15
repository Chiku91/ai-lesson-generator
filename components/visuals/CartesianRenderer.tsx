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
  const [precision, setPrecision] = useState<number>(2);
  const [showSteps, setShowSteps] = useState(true);

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

  // Container: ensures visible area on mobile. Option B: visualization is narrow on phones.
  // Provide a consistent min-height so Plotly has room to render.
  return (
    <div className="bg-white/5 p-2 rounded-lg border border-gray-800 min-h-[260px] sm:min-h-[320px]">
      {/* Controls */}
      <div className="mb-3">
        <h4 className="font-semibold text-sm text-gray-200 mb-2">Points</h4>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <input
              className="w-14 px-2 py-1 rounded bg-white text-black"
              type="number"
              value={A.x}
              onChange={(e) => setA({ ...A, x: Number(e.target.value) })}
            />
            <input
              className="w-14 px-2 py-1 rounded bg-white text-black"
              type="number"
              value={A.y}
              onChange={(e) => setA({ ...A, y: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              className="w-14 px-2 py-1 rounded bg-white text-black"
              type="number"
              value={B.x}
              onChange={(e) => setB({ ...B, x: Number(e.target.value) })}
            />
            <input
              className="w-14 px-2 py-1 rounded bg-white text-black"
              type="number"
              value={B.y}
              onChange={(e) => setB({ ...B, y: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Plotly area: responsive */}
      <div className="w-full h-[220px] sm:h-[320px]">
        <Plot
          data={[traceLine, traceMid]}
          layout={{
            autosize: true,
            margin: { l: 36, r: 12, t: 12, b: 36 },
            xaxis: { zeroline: true, dtick: 1 },
            yaxis: { zeroline: true, dtick: 1 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#e6edf3" },
            // width/height removed in favor of autosize + container styling
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />
      </div>

      {/* stats */}
      <div className="mt-2 text-xs text-gray-200">
        <div>dx: <span className="font-semibold">{dx.toFixed(precision)}</span></div>
        <div>dy: <span className="font-semibold">{dy.toFixed(precision)}</span></div>
        <div>Distance: <span className="font-semibold">{distance.toFixed(precision)}</span></div>
        <div>Midpoint: <span className="font-semibold">({midpoint.x.toFixed(precision)}, {midpoint.y.toFixed(precision)})</span></div>
      </div>

      {/* steps */}
      {showSteps && (
        <div className="mt-2 text-xs text-gray-300 bg-white/3 p-2 rounded">
          <ol className="list-decimal list-inside">
            <li>dx = x₂ − x₁ = {B.x} − {A.x} = {dx.toFixed(precision)}</li>
            <li>dy = y₂ − y₁ = {B.y} − {A.y} = {dy.toFixed(precision)}</li>
            <li>Distance = √(dx² + dy²) = {distance.toFixed(precision)}</li>
          </ol>
        </div>
      )}
    </div>
  );
}
