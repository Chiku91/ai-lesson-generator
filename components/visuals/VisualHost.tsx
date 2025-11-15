// components/visuals/VisualHost.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

const CartesianRenderer = dynamic(() => import("./CartesianRenderer"), { ssr: false });
const FlowRenderer = dynamic(() => import("./FlowRenderer"), { ssr: false });
const QuizRenderer = dynamic(() => import("./QuizRenderer"), { ssr: false });
const ImageRenderer = dynamic(() => import("./ImageRenderer"), { ssr: false });

// ✅ SAFE MapRenderer WITHOUT .catch()
const MapRenderer = dynamic(
  async () => {
    try {
      return await import("./MapRenderer");
    } catch (e) {
      return {
        default: () => (
          <div className="text-red-400 p-3">
            Map visualization is not available.
          </div>
        ),
      };
    }
  },
  { ssr: false }
);

// Plotly uses CartesianRenderer fallback
const PlotlyRenderer = CartesianRenderer;

export default function VisualHost({ schema }: { schema?: any }) {
  if (!schema) {
    return <div className="p-3 text-gray-400 text-sm">No schema</div>;
  }

  let type = String(schema.type || schema.visualization_type || "").toLowerCase();

  // Auto-detect type
  if (!type) {
    if (schema?.data_spec?.nodes && schema?.data_spec?.edges) type = "flow";
    else if (schema?.data_spec?.questions) type = "quiz";
    else if (schema?.data_spec?.A && schema?.data_spec?.B) type = "cartesian";
    else if (schema?.data_spec?.images) type = "image";
  }

  return (
    <div className="w-full h-full">
      {type === "cartesian" && <CartesianRenderer schema={schema} />}
      {type === "flow" && <FlowRenderer schema={schema} />}
      {type === "image" && <ImageRenderer schema={schema} />}
      {type === "quiz" && <QuizRenderer schema={schema} />}
      {type === "map" && <MapRenderer schema={schema} />}
      {type === "plotly" && <PlotlyRenderer schema={schema} />}

      {/* fallbacks */}
      {!type && schema?.data_spec?.A && <CartesianRenderer schema={schema} />}
      {!type && schema?.data_spec?.nodes && <FlowRenderer schema={schema} />}
      {!type && schema?.data_spec?.questions && <QuizRenderer schema={schema} />}
      {!type && schema?.data_spec?.images && <ImageRenderer schema={schema} />}
    </div>
  );
}
