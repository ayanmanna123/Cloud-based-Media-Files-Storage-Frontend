import React from "react";

export function UploadIcon({ className = "w-4 h-4", groupHoverClass = "group-hover:-translate-y-1.5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible shrink-0 ${className}`}
    >
      {/* Animated Arrow Head & Shaft (ONLY arrow moves upward on hover) */}
      <g className={`transition-transform duration-300 ease-out ${groupHoverClass}`}>
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </g>
      {/* Static Base Tray */}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </svg>
  );
}

export default UploadIcon;
