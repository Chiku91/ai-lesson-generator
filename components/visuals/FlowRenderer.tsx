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

/**
 * FlowRenderer uses an SVG. For responsiveness:
 * - we provide a container with a min-height (so it always has space)
 * - we use viewBox to make the SVG scale to container width
 * - nodes are positioned using layout width/height but the SVG scales
 */
export default function FlowRenderer({ schema }: { schema?: FlowSchema }) {
  const rawNodes = schema?.data_spec?.nodes;
  const nodes: FlowNode[] = Array.isArray(rawNodes)
    ? rawNodes.filter((n) => n && typeof n.id === "string")
    : [
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

  // Responsive layout defaults
  const width = schema?.layout?.width ?? 600;
  const height = schema?.layout?.height ?? 900;

  const nodeW = 220;
  const nodeH = 70;
  const gapY = 120;

  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    let currentY = 40;
    const centerX = width / 2 - nodeW / 2;

    nodes.forEach((n) => {
      pos.set(n.id, { x: centerX, y: currentY });
      currentY += nodeH + gapY;
    });

    return pos;
  }, [nodes, width]);

  const [selected, setSelected] = useState<string | null>(null);

  const curve = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const sx = from.x + nodeW / 2;
    const sy = from.y + nodeH;
    const ex = to.x + nodeW / 2;
    const ey = to.y;
    const mid = (sy + ey) / 2;
    return `M ${sx} ${sy} C ${sx} ${mid}, ${ex} ${mid}, ${ex} ${ey}`;
  };

  // Container ensures minimum visible area on mobile while the SVG scales to fit width
  return (
    <div className="bg-white/3 rounded border border-gray-800 p-2 min-h-[260px] sm:min-h-[360px]">
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
        .node-box { cursor: pointer; transition: 0.25s; }
        .node-box:hover { transform: scale(1.02); }
      `}</style>

      {/* Responsive SVG using viewBox - it will scale to the container width */}
      <div style={{ width: "100%", height: "100%", minHeight: 220 }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }}>
          <defs>
            <marker id="arrow" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
              <path d="M0,0 L12,6 L0,12 z" fill="#7c3aed" />
            </marker>
          </defs>

          {/* edges */}
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

          {/* nodes */}
          {nodes.map((n) => {
            const p = positions.get(n.id)!;
            return (
              <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={14}
                  fill={n.color ?? "#eef2ff"}
                  stroke="#7c3aed"
                  strokeWidth={1.4}
                  className="node-box"
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                />
                <text
                  x={nodeW / 2}
                  y={nodeH / 2 + 6}
                  textAnchor="middle"
                  fill="#0f172a"
                  style={{ fontWeight: 700, fontSize: 17, pointerEvents: "none" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected && (
        <div className="mt-3 p-2 bg-white/5 rounded text-sm">
          <h3 className="font-bold">{nodes.find((x) => x.id === selected)?.label}</h3>
          <p className="text-xs mt-1">
            {nodes.find((x) => x.id === selected)?.description ?? "No description available."}
          </p>
          <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
