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

/**
 * VisualHost renders the correct renderer and ensures the visualization
 * sits to the right and shrinks on small screens (Option B).
 *
 * Notes:
 * - The visualization wrapper has responsive widths so it remains right-aligned
 *   but becomes narrower on small viewports.
 * - Each renderer should still provide its own min-height; this wrapper
 *   ensures width/placement.
 */
export default function VisualHost({ schema }: { schema?: any }) {
  if (!schema)
    return (
      <div className="p-4 text-gray-500 text-center text-sm sm:text-base">
        No schema
      </div>
    );

  let type = String(schema.type || schema.visualization_type || "").toLowerCase();

  if (!type) {
    if (schema?.data_spec?.nodes && schema?.data_spec?.edges) type = "flow";
    else if (schema?.data_spec?.questions) type = "quiz";
    else if (schema?.data_spec?.A && schema?.data_spec?.B) type = "cartesian";
  }

  const title = String(schema.title ?? "").toLowerCase();
  const layoutPrefs = schema.layout ?? {};

  if (
    (title.includes("cycle") || title.includes("water cycle") || layoutPrefs?.layout_kind === "circular") &&
    type === "flow"
  ) {
    schema.layout = { ...(schema.layout || {}), layout_kind: "circular" };
  }

  // Option B widths:
  // - very small devices: visualization is narrow but visible
  // - medium+ devices: visualization occupies up to 40% of width
  // The wrapper also ensures a min height (child renderers should also set heights).
  const vizWrapperClass =
    "flex-shrink-0 w-36 sm:w-56 md:w-1/3 lg:w-2/5 xl:w-2/5 p-2";

  switch (type) {
    case "cartesian":
      return (
        <div className={vizWrapperClass}>
          <CartesianRenderer schema={schema} />
        </div>
      );
    case "flow":
      return (
        <div className={vizWrapperClass}>
          <FlowRenderer schema={schema} />
        </div>
      );
    case "map":
      return (
        <div className={vizWrapperClass}>
          <MapRenderer schema={schema} />
        </div>
      );
    case "image":
      return (
        <div className={vizWrapperClass}>
          <ImageRenderer schema={schema} />
        </div>
      );
    case "quiz":
      return (
        <div className={vizWrapperClass}>
          <QuizRenderer schema={schema} />
        </div>
      );
    case "plotly":
      return (
        <div className={vizWrapperClass}>
          <PlotlyRenderer schema={schema} />
        </div>
      );
    default:
      // best-effort fallbacks
      if (schema?.data_spec?.questions) return <QuizRenderer schema={schema} />;
      if (schema?.data_spec?.nodes && schema?.data_spec?.edges) return <FlowRenderer schema={schema} />;
      if (schema?.data_spec?.A && schema?.data_spec?.B) return <CartesianRenderer schema={schema} />;

      return <div className="text-red-400 p-4">Unknown visualization type: <b>{String(type)}</b></div>;
  }
}
