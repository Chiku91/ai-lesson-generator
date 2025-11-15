// components/visuals/FlowRenderer.tsx
"use client";

import React, { useMemo } from "react";

export default function FlowRenderer({ schema }: { schema?: any }) {
  const nodes = schema?.data_spec?.nodes ?? [];
  const edges = schema?.data_spec?.edges ?? [];

  const width = 600;
  const height = 900;

  const positions = useMemo(() => {
    const pos = new Map();
    let y = 40;
    nodes.forEach((n: any) => {
      pos.set(n.id, { x: width / 2 - 110, y });
      y += 130;
    });
    return pos;
  }, [nodes]);

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 min-h-[260px] sm:min-h-[360px]">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "100%" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {edges.map(([a, b]: any, i: number) => {
          const p1 = positions.get(a);
          const p2 = positions.get(b);
          if (!p1 || !p2) return null;
          return (
            <line
              key={i}
              x1={p1.x + 110}
              y1={p1.y + 70}
              x2={p2.x + 110}
              y2={p2.y}
              stroke="#6366f1"
              strokeWidth="3"
            />
          );
        })}

        {nodes.map((n: any) => {
          const p = positions.get(n.id)!;
          return (
            <g key={n.id} transform={`translate(${p.x},${p.y})`}>
              <rect
                width="220"
                height="70"
                fill="#eef2ff"
                stroke="#6366f1"
                strokeWidth="2"
                rx="12"
              />
              <text
                x="110"
                y="40"
                textAnchor="middle"
                fill="#1e293b"
                fontWeight="600"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

    </div>
  );
}
