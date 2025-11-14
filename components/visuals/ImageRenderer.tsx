// components/visuals/ImageRenderer.tsx
"use client";

import React from "react";

export default function ImageRenderer({ schema }: { schema?: any }) {
  const images = Array.isArray(schema?.data_spec?.images)
    ? schema.data_spec.images
    : [];

  if (images.length === 0) {
    return (
      <div className="text-red-500 p-4">
        No images available for this topic.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {images.map((img: any, i: number) => (
          <div
            key={i}
            className="border border-gray-700 bg-gray-900 rounded-xl p-4 shadow"
          >
            <img
              src={img.src}
              alt={img.alt ?? img.title}
              className="mx-auto max-h-64 object-contain rounded-lg"
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=Image+Unavailable")
              }
            />
            <div className="mt-3 font-semibold text-indigo-300">
              {img.title}
            </div>
            <div className="text-sm text-gray-400">{img.caption}</div>
          </div>
        ))}
      </div>

      {schema?.explanatory_markup && (
        <div
          className="mt-4 text-sm text-gray-400"
          dangerouslySetInnerHTML={{
            __html: schema.explanatory_markup,
          }}
        />
      )}
    </div>
  );
}
