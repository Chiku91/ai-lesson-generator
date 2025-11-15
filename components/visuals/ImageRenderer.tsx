// components/visuals/ImageRenderer.tsx
"use client";

import React from "react";

export default function ImageRenderer({ schema }: { schema?: any }) {
  const images = Array.isArray(schema?.data_spec?.images) ? schema.data_spec.images : [];

  if (images.length === 0) {
    return <div className="p-3 text-sm text-red-500">No images available for this topic.</div>;
  }

  // Option B: make image column narrow on small screens but ensure images are visible
  return (
    <div className="p-2">
      <div className="grid grid-cols-1 gap-4">
        {images.map((img: any, i: number) => (
          <div key={i} className="border border-gray-700 bg-gray-900 rounded-lg p-2">
            <img
              src={img.src}
              alt={img.alt ?? img.title}
              className="mx-auto max-h-48 w-full object-contain rounded"
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=Image+Unavailable")
              }
            />
            <div className="mt-2 font-semibold text-sm text-indigo-300">{img.title}</div>
            <div className="text-xs text-gray-400">{img.caption}</div>
          </div>
        ))}
      </div>

      {schema?.explanatory_markup && (
        <div className="mt-3 text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: schema.explanatory_markup }} />
      )}
    </div>
  );
}
