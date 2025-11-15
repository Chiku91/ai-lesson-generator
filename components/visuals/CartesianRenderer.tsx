// components/visuals/CartesianRenderer.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Point { x: number; y: number; }

export default function CartesianRenderer({ schema }: { schema?: any }) {
  const A0: Point = schema?.data_spec?.A ?? { x: -3, y: 4 };
  const B0: Point = schema?.data_spec?.B ?? { x: 5, y: -2 };

  const [A, setA] = useState<Point>(A0);
  const [B, setB] = useState<Point>(B0);

  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4">

      {/* Plot container */}
      <div className="w-full h-[260px] sm:h-[360px]">
        <Plot
          data={[
            {
              x: [A.x, B.x],
              y: [A.y, B.y],
              mode: "lines+markers",
              type: "scatter",
            },
            {
              x: [mid.x],
              y: [mid.y],
              mode: "markers+text",
              text: [`M(${mid.x},${mid.y})`],
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            margin: { l: 30, r: 10, t: 10, b: 30 },
            xaxis: { dtick: 1 },
            yaxis: { dtick: 1 },
          }}
          useResizeHandler
          config={{ responsive: true }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

    </div>
  );
}
