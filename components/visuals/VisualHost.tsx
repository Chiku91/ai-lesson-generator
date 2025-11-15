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
    return <div className="p-4 text-gray-400 text-center">No schema</div>;

  let type = schema.type || schema.visualization_type || "";

  // 🟣 Responsive layout:
  // Mobile: one column
  // Desktop: 2 columns (explanation left, visualization right)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

      {/* Explanation */}
      <div className="order-1 md:order-none space-y-4 text-sm text-gray-200 leading-relaxed">
        <div
          dangerouslySetInnerHTML={{
            __html: schema.explanatory_markup || "<p>No explanation available.</p>",
          }}
        />
      </div>

      {/* Visualization */}
      <div className="order-2 md:order-none">
        {type === "cartesian" && <CartesianRenderer schema={schema} />}
        {type === "flow" && <FlowRenderer schema={schema} />}
        {type === "image" && <ImageRenderer schema={schema} />}
        {type === "quiz" && <QuizRenderer schema={schema} />}
        {type === "plotly" && <PlotlyRenderer schema={schema} />}

        {/* Auto-detect fallback */}
        {!type && schema?.data_spec?.A && <CartesianRenderer schema={schema} />}
        {!type && schema?.data_spec?.nodes && <FlowRenderer schema={schema} />}
        {!type && schema?.data_spec?.questions && <QuizRenderer schema={schema} />}
      </div>

    </div>
  );
}
