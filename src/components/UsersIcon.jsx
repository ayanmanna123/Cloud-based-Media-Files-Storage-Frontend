import React from "react";

export function UsersIcon({ isOpen = false, className = "w-5 h-5", groupHover = true }) {
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
      {/* Front User Figure */}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />

      {/* Back User Figure (Peeks out on hover / active) */}
      <g
        className={`transition-transform duration-300 origin-center ${
          isOpen
            ? "translate-x-1 -translate-y-0.5"
            : groupHover
            ? "group-hover:translate-x-1 group-hover:-translate-y-0.5"
            : ""
        }`}
      >
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </g>
    </svg>
  );
}

export default UsersIcon;
