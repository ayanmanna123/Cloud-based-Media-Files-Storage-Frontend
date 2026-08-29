import React from "react";

export function ClockIcon({ isOpen = false, className = "w-5 h-5", groupHover = true }) {
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
      {/* Static Outer Clock Face */}
      <circle cx="12" cy="12" r="10" />
      {/* Animated Clock Hands */}
      <g
        className={`transition-transform duration-500 ease-in-out origin-[12px_12px] ${
          isOpen
            ? "rotate-45"
            : groupHover
            ? "group-hover:rotate-[360deg]"
            : ""
        }`}
      >
        <polyline points="12 6 12 12 16 14" />
      </g>
    </svg>
  );
}

export default ClockIcon;
