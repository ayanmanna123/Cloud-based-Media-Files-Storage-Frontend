import React from "react";

export function TrashBinIcon({ isOpen = false, className = "w-5 h-5", groupHover = true }) {
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
      {/* Animated Dustbin Lid */}
      <g className={`transition-transform duration-300 origin-[3px_6px] ${
        isOpen 
          ? "-rotate-45 -translate-y-1" 
          : (groupHover ? "group-hover:-rotate-45 group-hover:-translate-y-1" : "")
      }`}>
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </g>
      {/* Bin Body */}
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default TrashBinIcon;
