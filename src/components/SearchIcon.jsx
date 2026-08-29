import React from "react";

export function SearchIcon({ isSearching = false, className = "w-4 h-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-colors duration-300 ${
        isSearching
          ? "text-blue-600 dark:text-blue-400 drop-shadow-[0_0_4px_rgba(37,99,235,0.6)]"
          : "text-muted-foreground"
      } ${className}`}
    >
      {/* Magnifying Glass with smooth scanning motion when typing/searching */}
      <g className={isSearching ? "animate-[searchScan_1.5s_ease-in-out_infinite] origin-center" : ""}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        {isSearching && (
          <path d="M8 8a3 3 0 0 1 3-3" className="stroke-blue-300 dark:stroke-blue-200 opacity-90" strokeWidth="1.5" />
        )}
      </g>

      {isSearching && (
        <style>{`
          @keyframes searchScan {
            0%, 100% { transform: translateX(-1.5px) rotate(-6deg); }
            50% { transform: translateX(1.5px) rotate(6deg); }
          }
        `}</style>
      )}
    </svg>
  );
}

export function SearchingState({ query = "" }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in duration-300">
      <div className="relative w-20 h-20 flex items-center justify-center mb-4">
        {/* Outer Pulsing Sonar Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping duration-1000" />
        <div className="absolute inset-2 rounded-full border border-blue-400/30 animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-blue-500/5 backdrop-blur-2xs" />

        {/* Center Magnifying Glass Scanner */}
        <div className="relative z-10 animate-[searchingSweep_2s_ease-in-out_infinite]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_12px_rgba(37,99,235,0.5)]"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
            <path d="M9 9a2 2 0 0 1 2-2" className="stroke-blue-300 dark:stroke-blue-200" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Floating Particle Dots */}
        <span className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping [animation-delay:0.3s]" />
        <span className="absolute bottom-3 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping [animation-delay:0.7s]" />
        <span className="absolute top-4 left-3 w-1 h-1 rounded-full bg-indigo-400 animate-ping [animation-delay:1.1s]" />
      </div>

      <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-1.5">
        Searching
        <span className="inline-flex items-center gap-0.5">
          <span className="w-1 h-1 rounded-full bg-blue-600 animate-bounce [animation-delay:0s]" />
          <span className="w-1 h-1 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
          <span className="w-1 h-1 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
        </span>
      </h3>
      {query && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
          Finding items matching &quot;<span className="text-foreground font-medium">{query}</span>&quot;
        </p>
      )}

      <style>{`
        @keyframes searchingSweep {
          0%, 100% { transform: translateX(-8px) rotate(-12deg); }
          50% { transform: translateX(8px) rotate(12deg); }
        }
      `}</style>
    </div>
  );
}

export default SearchIcon;
