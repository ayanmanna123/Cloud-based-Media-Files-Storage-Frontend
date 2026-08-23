import {
  X,
  ChevronUp,
  ChevronDown,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react"

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
  const allDone = inProgressCount === 0

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[60vh]">
      <div 
        className="bg-muted p-3 flex items-center justify-between cursor-pointer border-b border-border"
        onClick={onToggleExpand}
      >
        <div className="font-medium text-sm">
          {allDone ? `Uploaded ${completedCount} file${completedCount !== 1 ? 's' : ''}` : `Uploading ${inProgressCount} file${inProgressCount !== 1 ? 's' : ''}`}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <button className="hover:text-foreground p-1 transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button 
            className="hover:text-foreground p-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-background scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors group">
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{task.name}</div>
                {task.status === 'uploading' && <div className="text-xs text-blue-500 font-medium">Uploading...</div>}
                {task.status === 'completed' && <div className="text-xs text-green-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Complete</div>}
                {task.status === 'error' && <div className="text-xs text-red-500 font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> {task.message || 'Failed'}</div>}
                {task.status === 'cancelled' && <div className="text-xs text-muted-foreground font-medium">Cancelled</div>}
              </div>
              {task.status === 'uploading' && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancel(task.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground transition-all"
                  >
                    <X className="w-4 h-4" />
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
