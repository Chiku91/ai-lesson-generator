// components/visuals/FlowRenderer.tsx
"use client";

import React, { useMemo, useState } from "react";

export interface FlowNode {
  id: string;
  label: string;
  color?: string;
  description?: string;
}

export interface FlowSchema {
  type?: string;
  data_spec?: {
    nodes?: FlowNode[];
    edges?: any;
  };
  layout?: {
    width?: number;
    height?: number;
  };
  explanatory_markup?: string;
}

export default function FlowRenderer({ schema }: { schema?: FlowSchema }) {
  const rawNodes = schema?.data_spec?.nodes ?? [
    { id: "start", label: "Start" },
    { id: "end", label: "End" },
  ];

  function normalizeEdges(input: any): Array<[string, string]> {
    const result: Array<[string, string]> = [];
    if (!input) return result;
    if (Array.isArray(input)) {
      input.forEach((item) => {
        if (Array.isArray(item) && item.length === 2) {
          const [a, b] = item;
          if (typeof a === "string" && typeof b === "string") result.push([a, b]);
        } else if (typeof item === "object" && item.from && item.to) {
          result.push([item.from, item.to]);
        } else if (typeof item === "string" && item.includes("->")) {
          const [a, b] = item.split("->").map((x) => x.trim());
          if (a && b) result.push([a, b]);
        }
      });
      return result;
    }
    if (typeof input === "string" && input.includes("->")) {
      const [a, b] = input.split("->").map((x) => x.trim());
      return [[a, b]];
    }
    if (typeof input === "object" && input.start && input.end) {
      return [[input.start, input.end]];
    }
    return result;
  }

  const edges = normalizeEdges(schema?.data_spec?.edges);

  // layout dims used for SVG viewBox (desktop default)
  const width = schema?.layout?.width ?? 700;
  const height = schema?.layout?.height ?? 900;

  // Node sizing (scale for desktop)
  const nodeW = 240; // slightly bigger for clear desktop
  const nodeH = 80;
  const gapY = 130;

  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    let currentY = 40;
    const centerX = width / 2 - nodeW / 2;
    (rawNodes || []).forEach((n) => {
      pos.set(n.id, { x: centerX, y: currentY });
      currentY += nodeH + gapY;
    });
    return pos;
  }, [rawNodes, width]);

  const [selected, setSelected] = useState<string | null>(null);

  const curve = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const sx = from.x + nodeW / 2;
    const sy = from.y + nodeH;
    const ex = to.x + nodeW / 2;
    const ey = to.y;
    const mid = (sy + ey) / 2;
    return `M ${sx} ${sy} C ${sx} ${mid}, ${ex} ${mid}, ${ex} ${ey}`;
  };

  return (
    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 min-h-[260px] sm:min-h-[360px] md:min-h-[520px]">
      <style>{`
        .edge-path {
          stroke: #7c3aed;
          stroke-width: 3;
          fill: none;
          stroke-linecap: round;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawEdge 0.9s ease forwards;
        }
        @keyframes drawEdge { to { stroke-dashoffset: 0; } }
      `}</style>

      <div style={{ width: "100%", height: "100%", minHeight: 220 }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }}>
          <defs>
            <marker id="arrow" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
              <path d="M0,0 L12,6 L0,12 z" fill="#7c3aed" />
            </marker>
          </defs>

          {edges.map(([from, to], i) => {
            const p1 = positions.get(from);
            const p2 = positions.get(to);
            if (!p1 || !p2) return null;
            return (
              <path
                key={i}
                d={curve(p1, p2)}
                className="edge-path"
                markerEnd="url(#arrow)"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            );
          })}

          {rawNodes.map((n: any) => {
            const p = positions.get(n.id)!;
            return (
              <g key={n.id} transform={`translate(${p.x}, ${p.y})`} onClick={() => setSelected(selected === n.id ? null : n.id)}>
                <rect width={nodeW} height={nodeH} rx={12} fill={n.color ?? "#eef2ff"} stroke="#7c3aed" strokeWidth={1.6} />
                <text x={nodeW / 2} y={nodeH / 2 + 6} textAnchor="middle" fill="#0f172a" style={{ fontWeight: 700, fontSize: 16 }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected && (
        <div className="mt-3 p-3 bg-white/5 rounded text-sm">
          <h3 className="font-bold">{rawNodes.find((x: any) => x.id === selected)?.label}</h3>
          <p className="text-xs mt-1">
            {rawNodes.find((x: any) => x.id === selected)?.description ?? "No description available."}
          </p>
          <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
