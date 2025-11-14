// components/visuals/PlotlyRenderer.tsx
"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function PlotlyRenderer({ schema }: { schema?: any }) {
  const ds = schema?.data_spec ?? {};
  const type = ds.type ?? ds.func ?? "sine";

  const [freq, setFreq] = useState(ds.frequencyDefault ?? 1);
  const [amp, setAmp] = useState(ds.amplitudeDefault ?? 1);

  const data = useMemo(() => {
    if (type === "sine") {
      const x = Array.from({ length: 200 }, (_, i) => i / 10 - 10);
      const y = x.map((v) => amp * Math.sin(freq * v));
      return [{ x, y, mode: "lines", type: "scatter" as const }];
    }
    if (type === "count") {
      const n = ds.n ?? 10;
      return [{ x: Array.from({ length: n }, (_, i) => i + 1), y: Array.from({ length: n }, (_, i) => i + 1), type: "bar" as const }];
    }
    return [];
  }, [type, ds, freq, amp]);

  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm text-gray-600">Frequency</label>
        <input type="range" min={0.1} max={5} step={0.1} value={freq} onChange={(e) => setFreq(Number(e.target.value))} />
        <label className="block text-sm text-gray-600">Amplitude</label>
        <input type="range" min={0.1} max={5} step={0.1} value={amp} onChange={(e) => setAmp(Number(e.target.value))} />
      </div>

      <Plot data={data} layout={{ ...(schema?.layout ?? {}), width: 640, height: 380 }} config={{ responsive: true }} />
      <div className="mt-2 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: schema?.explanatory_markup ?? "" }} />
    </div>
  );
}
