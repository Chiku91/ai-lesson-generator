// components/visuals/CartesianRenderer.tsx
"use client";

import React, { useState } from "react";
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

  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midpoint = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold text-gray-700 mb-2">Point Inputs</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Point A (x, y)</label>
            <div className="flex gap-2 mt-1">
              <input className="w-16 px-2 py-1 border rounded text-black" type="number" value={A.x} onChange={(e) => setA({ ...A, x: Number(e.target.value) })} />
              <input className="w-16 px-2 py-1 border rounded text-black" type="number" value={A.y} onChange={(e) => setA({ ...A, y: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Point B (x, y)</label>
            <div className="flex gap-2 mt-1">
              <input className="w-16 px-2 py-1 border rounded text-black" type="number" value={B.x} onChange={(e) => setB({ ...B, x: Number(e.target.value) })} />
              <input className="w-16 px-2 py-1 border rounded text-black" type="number" value={B.y} onChange={(e) => setB({ ...B, y: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs text-gray-600">Precision: <span className="text-black font-semibold">{precision}</span></label>
          <input className="w-full mt-1" type="range" min={0} max={4} step={1} value={precision} onChange={(e) => setPrecision(Number(e.target.value))} />
        </div>

        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowSteps((s) => !s)}>{showSteps ? "Hide Steps" : "Show Steps"}</button>
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => { const r = () => Math.floor(Math.random() * 11 - 5); setA({ x: r(), y: r() }); setB({ x: r(), y: r() }); }}>Randomize</button>
        </div>
      </div>

      <div className="bg-white p-3 rounded shadow">
        <Plot
          data={[traceLine, traceMid]}
          layout={{
            width: schema?.layout?.width ?? 420,
            height: schema?.layout?.height ?? 380,
            xaxis: { zeroline: true, dtick: 1 },
            yaxis: { zeroline: true, dtick: 1 },
            margin: { l: 40, r: 20, t: 20, b: 40 },
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#fff",
            font: { color: "#111" },
          }}
          config={{ responsive: true }}
        />
        <div className="mt-3 text-sm text-gray-800">
          <div>dx: <span className="text-black font-semibold">{dx.toFixed(precision)}</span></div>
          <div>dy: <span className="text-black font-semibold">{dy.toFixed(precision)}</span></div>
          <div>Distance: <span className="text-black font-semibold">{distance.toFixed(precision)}</span></div>
          <div>Midpoint: <span className="text-black font-semibold">({midpoint.x.toFixed(precision)}, {midpoint.y.toFixed(precision)})</span></div>
        </div>

        {showSteps && (
          <div className="mt-3 p-2 bg-gray-50 border rounded text-xs text-gray-700">
            <div className="font-medium mb-1">Steps</div>
            <ol className="list-decimal list-inside">
              <li>Compute dx = x₂ − x₁ = {B.x} − {A.x} = {dx.toFixed(precision)}</li>
              <li>Compute dy = y₂ − y₁ = {B.y} − {A.y} = {dy.toFixed(precision)}</li>
              <li>Distance = √(dx² + dy²) = {distance.toFixed(precision)}</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
