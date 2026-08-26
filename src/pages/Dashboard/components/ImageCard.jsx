import React from 'react';

/**
 * Reusable standalone Image Preview Card component.
 * Features:
 * - White card background with ~12px rounded corners
 * - Thin light-gray border and soft minimal shadow
 * - Internal padding around the image
 * - Centered uncropped image preserving original aspect ratio
 * - No text, labels, icons, or buttons below/outside the image
 */
export function ImageCard({ 
  src, 
  alt = 'Image preview', 
  onClick, 
  onDoubleClick,
  isSelected = false,
  className = '' 
}) {
  return (
    <div 
      className={`group bg-white dark:bg-card border rounded-[12px] p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex items-center justify-center relative w-full h-[340px] select-none ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200/80 dark:border-border'
      } ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300 pointer-events-none"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}

export default ImageCard;
