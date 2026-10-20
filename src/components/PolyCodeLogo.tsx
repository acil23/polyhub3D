'use client';

import React from 'react';

export default function PolyCodeLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-[0_0_15px_rgba(59,130,246,0.45)]`}
    >
      <defs>
        <linearGradient id="pcBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="pcTop" x1="12" y1="10" x2="52" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="pcLeft" x1="12" y1="22" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="pcRight" x1="32" y1="22" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <rect
        width="64"
        height="64"
        rx="16"
        fill="url(#pcBg)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <polygon points="32,10 52,21.5 32,33 12,21.5" fill="url(#pcTop)" />
      <polygon points="12,21.5 32,33 32,55 12,43.5" fill="url(#leftFace)" />
      <polygon points="32,33 52,21.5 52,43.5 32,55" fill="url(#pcRight)" />
      <polyline
        points="12,21.5 32,33 52,21.5"
        stroke="#e0f2fe"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="32" y1="33" x2="32" y2="55" stroke="#e0f2fe" strokeWidth="1.7" strokeLinecap="round" />
      <polygon
        points="32,10 52,21.5 52,43.5 32,55 12,43.5 12,21.5"
        stroke="#38bdf8"
        strokeWidth="1.4"
        strokeOpacity="0.8"
        fill="none"
        strokeLinejoin="round"
      />
      <polyline
        points="23,34 18,37 23,42"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="41,34 46,37 41,42"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
