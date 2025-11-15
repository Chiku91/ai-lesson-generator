// components/visuals/ImageRenderer.tsx
"use client";

import React from "react";

export default function ImageRenderer({ schema }: { schema?: any }) {
  const images = Array.isArray(schema?.data_spec?.images) ? schema.data_spec.images : [];

  if (images.length === 0) {
    return <div className="p-3 text-sm text-red-500">No images available for this topic.</div>;
  }

  return (
    <div className="space-y-4">
      {images.map((img: any, i: number) => (
        <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800">
          <img
            src={img.src}
            alt={img.alt ?? img.title}
            className="w-full object-contain rounded max-h-[240px] sm:max-h-[360px] md:max-h-[520px]"
            onError={(e) =>
              ((e.target as HTMLImageElement).src =
                "https://via.placeholder.com/600x400?text=Image+Unavailable")
            }
          />
          <div className="mt-3 font-semibold text-sm sm:text-base text-indigo-300">{img.title}</div>
          <div className="text-xs sm:text-sm text-gray-400">{img.caption}</div>
        </div>
      ))}
    </div>
  );
}
