// components/visuals/ImageRenderer.tsx
"use client";

import React from "react";

export default function ImageRenderer({ schema }: { schema?: any }) {
  const images = schema?.data_spec?.images ?? [];

  return (
    <div className="space-y-3">
      {images.map((img: any, i: number) => (
        <div
          key={i}
          className="bg-gray-900 p-3 rounded-xl border border-gray-800"
        >
          <img
            src={img.src}
            alt={img.title}
            className="w-full max-h-56 object-contain rounded"
          />
          <p className="mt-2 text-sm text-indigo-300">{img.title}</p>
          <p className="text-xs text-gray-400">{img.caption}</p>
        </div>
      ))}
    </div>
  );
}
