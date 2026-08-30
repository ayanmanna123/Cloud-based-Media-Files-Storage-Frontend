import React, { useEffect } from 'react';
import {
  X,
  ChevronUp,
  ChevronDown,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react"

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatTime = (seconds) => {
  if (seconds === undefined || seconds === null || seconds === Infinity || isNaN(seconds)) return 'Calculating...';
  if (seconds < 60) return `${Math.round(seconds)}s left`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s left`;
};

export function UploadProgress({ 
  tasks, 
  isExpanded, 
  onToggleExpand, 
  onClose, 
  onCancel 
}) {
  if (tasks.length === 0) return null

  const inProgressCount = tasks.filter(t => t.status === 'uploading' || t.status === 'pending').length
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const allDone = inProgressCount === 0 && tasks.length > 0;

  useEffect(() => {
    let timeout;
    if (allDone) {
      timeout = setTimeout(() => {
        onClose();
      }, 3000); // auto-close after 3 seconds
    }
    return () => clearTimeout(timeout);
  }, [allDone, onClose]);

  return (
    <div className="fixed bottom-3 right-3 w-[270px] sm:w-72 md:w-80 max-w-[calc(100vw-24px)] bg-card border border-border/80 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[40vh] sm:max-h-[55vh] transition-all duration-200">
      {/* Header bar */}
      <div 
        className="bg-muted/70 hover:bg-muted/90 px-3 py-2 flex items-center justify-between cursor-pointer border-b border-border/60 select-none transition-colors"
        onClick={onToggleExpand}
      >
        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5 truncate">
          <span className="truncate">
            {allDone ? `Uploaded ${completedCount} file${completedCount !== 1 ? 's' : ''}` : `Uploading ${inProgressCount} file${inProgressCount !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground shrink-0">
          <button 
            className="hover:text-foreground p-0.5 rounded hover:bg-background/50 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button 
            className="hover:text-foreground p-0.5 rounded hover:bg-background/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Tasks List */}
      {isExpanded && (
        <div className="overflow-y-auto flex-1 p-1.5 space-y-1 bg-background scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 p-1.5 bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors group">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate text-foreground leading-tight">{task.name}</div>
                {task.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span className="truncate">{formatBytes(task.loaded || 0)} / {formatBytes(task.totalSize || 0)}</span>
                      <span className="font-mono text-[9px] shrink-0 ml-1">{task.speed ? `${formatBytes(task.speed)}/s` : 'Starting...'}</span>
                    </div>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                      {formatTime(task.timeRemaining)}
                    </div>
                  </div>
                )}
                {task.status === 'completed' && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Complete
                  </div>
                )}
                {task.status === 'error' && (
                  <div className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                    <XCircle className="w-3 h-3 shrink-0" /> <span className="truncate">{task.message || 'Failed'}</span>
                  </div>
                )}
                {task.status === 'cancelled' && (
                  <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    Cancelled
                  </div>
                )}
              </div>
              {task.status === 'uploading' && (
                <div className="flex items-center gap-1 shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancel(task.id)
                    }}
                    className="p-0.5 hover:bg-red-500/10 hover:text-red-500 rounded text-muted-foreground transition-all sm:opacity-0 sm:group-hover:opacity-100"
                    title="Cancel upload"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
