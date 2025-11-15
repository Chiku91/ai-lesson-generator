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
    (title.includes("cycle") || layoutPrefs?.layout_kind === "circular") &&
    type === "flow"
  ) {
    schema.layout = { ...(schema.layout || {}), layout_kind: "circular" };
  }

  // ⭐ UNIVERSAL SAFE HEIGHT for all renderers
  const baseWrapper = "w-full max-w-full overflow-x-auto min-h-[320px] sm:min-h-[480px]";

  return (
    <div className="w-full max-w-full p-2 sm:p-4">
      <div className="w-full flex justify-center items-center">
        {(() => {
          switch (type) {
            case "cartesian":
              return (
                <div className={baseWrapper}>
                  <CartesianRenderer schema={schema} />
                </div>
              );

            case "flow":
              return (
                <div className={baseWrapper}>
                  <FlowRenderer schema={schema} />
                </div>
              );

            case "map":
              return (
                <div className={baseWrapper}>
                  <MapRenderer schema={schema} />
                </div>
              );

            case "image":
              return (
                <div className="w-full max-w-full flex justify-center min-h-[250px]">
                  <ImageRenderer schema={schema} />
                </div>
              );

            case "quiz":
              return (
                <div className="w-full max-w-full sm:max-w-md mx-auto min-h-[200px]">
                  <QuizRenderer schema={schema} />
                </div>
              );

            case "plotly":
              return (
                <div className={baseWrapper}>
                  <PlotlyRenderer schema={schema} />
                </div>
              );

            default:
              if (schema?.data_spec?.questions)
                return <QuizRenderer schema={schema} />;

              if (schema?.data_spec?.nodes && schema?.data_spec?.edges)
                return <FlowRenderer schema={schema} />;

              if (schema?.data_spec?.A && schema?.data_spec?.B)
                return <CartesianRenderer schema={schema} />;

              return (
                <div className="text-red-400 p-4 text-center text-sm sm:text-base">
                  Unknown visualization type: <b>{String(type)}</b>
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
}
