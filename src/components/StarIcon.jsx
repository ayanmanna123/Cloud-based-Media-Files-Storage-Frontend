import React from "react";

export function StarIcon({ isOpen = false, className = "w-5 h-5", groupHover = true }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={isOpen ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible shrink-0 transition-transform duration-300 origin-center ${
        isOpen
          ? "scale-110 rotate-12"
          : groupHover
          ? "group-hover:rotate-12 group-hover:scale-110"
          : ""
      } ${className}`}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default StarIcon;
