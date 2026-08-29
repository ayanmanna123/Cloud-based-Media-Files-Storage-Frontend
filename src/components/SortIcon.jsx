import React from "react";

export function SortIcon({ className = "w-4 h-4", groupHoverClassUp = "group-hover:-translate-y-1.5", groupHoverClassDown = "group-hover:translate-y-1.5" }) {
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
      {/* Upward Arrow (Left side - moves UP on hover) */}
      <g className={`transition-transform duration-300 ease-out ${groupHoverClassUp}`}>
        <path d="m3 8 4-4 4 4" />
        <path d="M7 4v16" />
      </g>
      {/* Downward Arrow (Right side - moves DOWN on hover) */}
      <g className={`transition-transform duration-300 ease-out ${groupHoverClassDown}`}>
        <path d="m21 16-4 4-4-4" />
        <path d="M17 20V4" />
      </g>
    </svg>
  );
}

export default SortIcon;
