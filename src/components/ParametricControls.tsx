'use client';

import React from 'react';
import { ParamSchema, ParamValues } from '@/types/polycode';

interface ParametricControlsProps {
  schema: ParamSchema;
  values: ParamValues;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
}

export default function ParametricControls({
  schema,
  values,
  onChange,
  onReset
}: ParametricControlsProps) {
  const keys = Object.keys(schema);

  if (keys.length === 0) {
    return (
      <div className="text-xs text-zinc-400 p-4 border border-white/10 rounded-xl bg-zinc-900/40">
        Skrip ini tidak mendeklarasikan objek <code>params</code>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
            Parametric Controls
          </span>
          <span className="text-[11px] text-zinc-500">Kustomisasi real-time sebelum ekspor</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 border border-white/10 transition"
        >
          Reset
        </button>
      </div>

      {keys.map((key) => {
        const item = schema[key];
        const val = values[key] ?? item.default;

        return (
          <div
            key={key}
            className="space-y-2 bg-zinc-900/60 hover:bg-zinc-900/90 p-3.5 rounded-xl border border-white/10 transition"
          >
            <div className="flex justify-between items-center text-xs">
              <label className="text-zinc-200 font-medium">{item.label || key}</label>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {String(val)}
              </span>
            </div>

            {item.type === 'number' && (
              <input
                type="range"
                min={item.min ?? 0.1}
                max={item.max ?? 10}
                step={item.step ?? 0.1}
                value={Number(val)}
                onChange={(e) => onChange(key, parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            )}

            {item.type === 'color' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={String(val)}
                  onChange={(e) => onChange(key, e.target.value)}
                  className="w-full h-8 rounded-lg cursor-pointer bg-zinc-800 border border-white/10 p-0.5"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
