// components/visuals/VisualHost.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

const CartesianRenderer = dynamic(() => import("./CartesianRenderer"), { ssr: false });
const FlowRenderer = dynamic(() => import("./FlowRenderer"), { ssr: false });
const MapRenderer = dynamic(() => import("./MapRenderer"), { ssr: false });
const QuizRenderer = dynamic(() => import("./QuizRenderer"), { ssr: false });
const PlotlyRenderer = dynamic(() => import("./PlotlyRenderer"), { ssr: false });
const ImageRenderer = dynamic(() => import("./ImageRenderer"), { ssr: false });

export default function VisualHost({ schema }: { schema?: any }) {
  if (!schema) return <div className="p-4 text-gray-500">No schema</div>;

  // Accept both standard places: schema.type or visualization_type
  let type = String(schema.type || schema.visualization_type || "").toLowerCase();

  // Repair: if schema contains nodes+edges but no type, assume flow
  if (!type) {
    if (schema?.data_spec?.nodes && schema?.data_spec?.edges) type = "flow";
    else if (schema?.data_spec?.questions) type = "quiz";
    else if (schema?.data_spec?.A && schema?.data_spec?.B) type = "cartesian";
  }

  // Force circular layout for common cycle keywords (also if generate.ts marked layout_kind)
  const title = String(schema.title ?? "").toLowerCase();
  const layoutPrefs = schema.layout ?? {};
  if ((title.includes("cycle") || title.includes("water cycle") || layoutPrefs?.layout_kind === "circular") && type === "flow") {
    schema.layout = { ...(schema.layout || {}), layout_kind: "circular" };
  }

  switch (type) {
    case "cartesian":
      return <CartesianRenderer schema={schema} />;
    case "flow":
      return <FlowRenderer schema={schema} />;
    case "map":
      return <MapRenderer schema={schema} />;
    case "image":
      return <ImageRenderer schema={schema} />;
    case "quiz":
      return <QuizRenderer schema={schema} />;
    case "plotly":
      return <PlotlyRenderer schema={schema} />;
    default:
      // best-effort fallbacks:
      if (schema?.data_spec?.questions) return <QuizRenderer schema={schema} />;
      if (schema?.data_spec?.nodes && schema?.data_spec?.edges) return <FlowRenderer schema={schema} />;
      if (schema?.data_spec?.A && schema?.data_spec?.B) return <CartesianRenderer schema={schema} />;

      return <div className="text-red-400 p-4">Unknown visualization type: <b>{String(type)}</b></div>;
  }
}
