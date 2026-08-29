import React from "react";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  File
} from "lucide-react";

export function getFileCategory(filename = "") {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "avif", "heic", "heif"].includes(ext)) {
    return {
      type: "image",
      icon: FileImage,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badgeBg: "bg-amber-500 text-white",
      label: ext.toUpperCase() || "IMG"
    };
  }
  if (["mp4", "mov", "avi", "mkv", "webm", "flv"].includes(ext)) {
    return {
      type: "video",
      icon: FileVideo,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      badgeBg: "bg-purple-500 text-white",
      label: ext.toUpperCase() || "VIDEO"
    };
  }
  if (["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"].includes(ext)) {
    return {
      type: "audio",
      icon: FileAudio,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      badgeBg: "bg-pink-500 text-white",
      label: ext.toUpperCase() || "AUDIO"
    };
  }
  if (["csv", "xlsx", "xls", "ods"].includes(ext)) {
    return {
      type: "spreadsheet",
      icon: FileSpreadsheet,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badgeBg: "bg-emerald-600 text-white",
      label: ext.toUpperCase() || "XLS"
    };
  }
  if (["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "cpp", "c", "java", "php", "sql", "sh", "xml", "yml", "yaml"].includes(ext)) {
    return {
      type: "code",
      icon: FileCode,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      badgeBg: "bg-cyan-600 text-white",
      label: ext.toUpperCase() || "CODE"
    };
  }
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "iso"].includes(ext)) {
    return {
      type: "archive",
      icon: FileArchive,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      badgeBg: "bg-orange-600 text-white",
      label: ext.toUpperCase() || "ZIP"
    };
  }
  if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(ext)) {
    return {
      type: "document",
      icon: FileText,
      color: ext === "pdf" ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-blue-500 bg-blue-500/10 border-blue-500/20",
      badgeBg: ext === "pdf" ? "bg-rose-500 text-white" : "bg-blue-600 text-white",
      label: ext.toUpperCase() || "DOC"
    };
  }
  return {
    type: "default",
    icon: File,
    color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    badgeBg: "bg-slate-600 text-white",
    label: ext.toUpperCase() || "FILE"
  };
}

export function FileIcon({ filename, className = "w-5 h-5" }) {
  const cat = getFileCategory(filename);
  const IconComponent = cat.icon;
  return <IconComponent className={`${cat.color.split(" ")[0]} ${className}`} />;
}

export function FileCardPlaceholder({ filename }) {
  const cat = getFileCategory(filename);
  const IconComponent = cat.icon;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative group-hover:scale-105 transition-transform duration-300">
      <div className={`p-4 rounded-2xl border ${cat.color} flex items-center justify-center shadow-xs mb-2 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1`}>
        <IconComponent className="w-10 h-10" />
      </div>
      <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs uppercase ${cat.badgeBg}`}>
        {cat.label}
      </span>
    </div>
  );
}

export default FileIcon;
