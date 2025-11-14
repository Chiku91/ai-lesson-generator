// components/visuals/ControlsPanel.tsx
import React from "react";

type ControlDef = {
  id: string;
  label?: string;
  control_type?: "slider" | "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  default?: any;
  options?: { value: any; label: string }[];
};

export default function ControlsPanel({
  controls,
  values,
  onChange
}: {
  controls: ControlDef[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
}) {
  return (
    <div className="space-y-3">
      {controls?.map((c) => {
        const val = values[c.id] ?? c.default ?? 0;
        if (c.control_type === "slider") {
          return (
            <div key={c.id} className="flex items-center gap-3">
              <label className="w-40 text-sm text-gray-600">{c.label ?? c.id}</label>
              <input type="range" min={c.min ?? 0} max={c.max ?? 1} step={c.step ?? 0.1} value={val} onChange={(e) => onChange(c.id, Number(e.target.value))} className="flex-1" />
              <input type="number" value={val} onChange={(e) => onChange(c.id, Number(e.target.value))} className="w-20 px-2 py-1 border rounded" />
            </div>
          );
        }
        if (c.control_type === "number" || !c.control_type) {
          return (
            <div key={c.id} className="flex items-center gap-3">
              <label className="w-40 text-sm text-gray-600">{c.label ?? c.id}</label>
              <input type="number" value={val} onChange={(e) => onChange(c.id, Number(e.target.value))} className="w-40 px-2 py-1 border rounded" />
            </div>
          );
        }
        if (c.control_type === "select") {
          return (
            <div key={c.id} className="flex items-center gap-3">
              <label className="w-40 text-sm text-gray-600">{c.label ?? c.id}</label>
              <select value={val} onChange={(e) => onChange(c.id, e.target.value)} className="px-2 py-1 border rounded">
                {c.options?.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
