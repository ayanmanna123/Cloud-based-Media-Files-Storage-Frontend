import React from "react";
import { Folder, FolderOpen } from "lucide-react";

export function FolderOpenIcon({ isOpen = false, className = "w-5 h-5", groupHover = true }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Normal Closed Folder from lucide-react */}
      <Folder
        className={`w-full h-full transition-all duration-300 ${
          isOpen
            ? "opacity-0 scale-90 -rotate-6"
            : groupHover
            ? "group-hover:opacity-0 group-hover:scale-90 group-hover:-rotate-6 opacity-100 scale-100 rotate-0"
            : "opacity-100 scale-100 rotate-0"
        }`}
      />
      {/* Open Folder from lucide-react */}
      <FolderOpen
        className={`absolute inset-0 w-full h-full transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100 rotate-0"
            : groupHover
            ? "group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 opacity-0 scale-90 rotate-6"
            : "opacity-0 scale-90 rotate-6"
        }`}
      />
    </div>
  );
}

export default FolderOpenIcon;
