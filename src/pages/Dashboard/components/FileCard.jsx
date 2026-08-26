import { useState } from "react"
import {
  MoreVertical,
  Star,
  Users,
  Edit2,
  Trash2,
  Download,
  FolderInput,
  RotateCcw,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  Clock,
  Copy,
  Link,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../../components/ui/context-menu"

const getFileIcon = (filename) => {
  if (!filename) return FileText
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return FileImage
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return FileVideo
  if (['csv', 'xlsx', 'xls'].includes(ext)) return FileSpreadsheet
  return FileText
}

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileCard({
  file,
  viewMode,
  currentView,
  starredItems,
  onToggleStar,
  onShare,
  onRename,
  onMove,
  onDelete,
  onDownload,
  onRestore,
  onDeleteForever,
  onOpenVersionHistory,
  onEdit,
  isSelected,
  onClick,
  onOpen,
  onPreview
}) {
  const Icon = getFileIcon(file.name)
  const isEditable = file.name.match(/\.(txt|md|csv|json|js|jsx|ts|tsx|html|css|xml|yml|yaml|ini|env|log)$/i)
  const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = file.name.match(/\.(pdf)$/i)
  const isVideo = file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)
  const isOfficeDoc = file.name.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i)
  const previewUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}?tr=w-600,h-800,c-at_max`
  const thumbnailUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}/ik-thumbnail.jpg?tr=w-600,h-800,c-at_max`
  const isStarred = starredItems.includes(`file_${file.id}`)
  const [dimensions, setDimensions] = useState(file.width && file.height ? `${file.width}x${file.height}` : null)
  const [copied, setCopied] = useState(false)

  const rawStorageKey = (file.storageKey || '').replace(/^\//, '')
  const endpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '')
  let fileUrl = file.url || `${endpoint}/${rawStorageKey}`
  if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    fileUrl = `https://${fileUrl}`
  }

  const handleCopyUrl = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fileUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fileUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy URL failed:", err);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = fileUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
    }
  }

  const handleOpen = () => {
    if (onOpen) onOpen();
    if ((isImage || isVideo) && onPreview) {
      onPreview(file);
    } else if (isOfficeDoc) {
      window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank')
    } else {
      window.open(fileUrl, '_blank')
    }
  }

  const DropdownActions = () => (
    <DropdownMenuContent align="end">
      {currentView === 'trash' ? (
        <>
          <DropdownMenuItem onClick={() => onRestore(file.id, 'file')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
            <RotateCcw className="w-4 h-4 mr-2" /> Restore
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDeleteForever(file.id, 'file')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
          </DropdownMenuItem>
        </>
      ) : currentView === 'shared' ? (
        <>
          {isEditable && file.permission === 'editor' && (
            <DropdownMenuItem onClick={() => setTimeout(() => onEdit(file), 0)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onDownload(file.id, file.name)}>
            <Download className="w-4 h-4 mr-2" /> Download
          </DropdownMenuItem>
        </>
      ) : (
        <>
          {isEditable && (
            <DropdownMenuItem onClick={() => setTimeout(() => onEdit(file), 0)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onDownload(file.id, file.name)}>
            <Download className="w-4 h-4 mr-2" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyUrl}>
            <Copy className="w-4 h-4 mr-2" /> Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => onShare({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name }), 0)}>
            <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => onShare({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name }), 0)}>
            <Users className="w-4 h-4 mr-2 text-blue-600" /> Who has access
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => onRename({ isOpen: true, id: file.id, currentName: file.name }), 0)}>
            <Edit2 className="w-4 h-4 mr-2" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => onMove(file.id, file.name), 0)}>
            <FolderInput className="w-4 h-4 mr-2" /> Move
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => onOpenVersionHistory({ isOpen: true, fileId: file.id, fileName: file.name, currentVersionId: file.versionId }), 0)}>
            <Clock className="w-4 h-4 mr-2" /> Version History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );

  const ContextActions = () => (
    <ContextMenuContent className="w-48">
      {currentView === 'trash' ? (
        <>
          <ContextMenuItem onClick={() => onRestore(file.id, 'file')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
            <RotateCcw className="w-4 h-4 mr-2" /> Restore
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDeleteForever(file.id, 'file')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
          </ContextMenuItem>
        </>
      ) : currentView === 'shared' ? (
        <>
          {isEditable && file.permission === 'editor' && (
            <ContextMenuItem onClick={() => setTimeout(() => onEdit(file), 0)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => onDownload(file.id, file.name)}>
            <Download className="w-4 h-4 mr-2" /> Download
          </ContextMenuItem>
        </>
      ) : (
        <>
          {isEditable && (
            <ContextMenuItem onClick={() => setTimeout(() => onEdit(file), 0)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => onDownload(file.id, file.name)}>
            <Download className="w-4 h-4 mr-2" /> Download
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyUrl}>
            <Copy className="w-4 h-4 mr-2" /> Copy Link
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => onShare({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name }), 0)}>
            <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => onRename({ isOpen: true, id: file.id, currentName: file.name }), 0)}>
            <Edit2 className="w-4 h-4 mr-2" /> Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => onMove(file.id, file.name), 0)}>
            <FolderInput className="w-4 h-4 mr-2" /> Move
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => onOpenVersionHistory({ isOpen: true, fileId: file.id, fileName: file.name, currentVersionId: file.versionId }), 0)}>
            <Clock className="w-4 h-4 mr-2" /> Version History
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onDelete(file.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );

  if (viewMode === "list") {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div 
            className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group cursor-pointer select-none ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
            onClick={onClick}
            onDoubleClick={handleOpen}
          >
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{file.name}</span>
        </div>
        <div className="hidden sm:block w-32 shrink-0 text-sm text-muted-foreground truncate">
          {currentView === 'shared' ? (file.ownerName || 'Unknown') : 'me'}
        </div>
        <div className="hidden md:block w-32 shrink-0 text-sm text-muted-foreground truncate">
          {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
        </div>
        <div className="hidden sm:block w-20 shrink-0 text-sm text-muted-foreground truncate">
          {file.sizeBytes ? formatBytes(file.sizeBytes) : '--'}
        </div>
        <div className="w-8 shrink-0 flex justify-end">
          {currentView !== 'trash' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.id, 'file', isStarred);
              }}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${isStarred ? 'text-yellow-400' : 'text-muted-foreground'}`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
          )}
          <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-muted-foreground">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownActions />
            </DropdownMenu>
          </div>
        </div>
      </div>
        </ContextMenuTrigger>
        <ContextActions />
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className={`group border rounded-xl bg-card hover:shadow-md transition-all cursor-pointer flex flex-col relative overflow-hidden h-[340px] select-none ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-border'}`}
          onClick={onClick}
          onDoubleClick={handleOpen}
        >
      <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden relative">
        {(isImage || isPdf || isVideo) ? (
          <>
            <img 
              src={(isPdf || isVideo) ? thumbnailUrl : previewUrl} 
              alt={file.name} 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onLoad={(e) => {
                if (e.target.naturalWidth && e.target.naturalHeight) {
                  setDimensions(`${e.target.naturalWidth}x${e.target.naturalHeight}`);
                }
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex';
                }
              }}
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-2">
                  <FileVideo className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </>
        ) : null}
        <div className={`flex flex-col items-center justify-center text-muted-foreground w-full h-full absolute inset-0 ${(isImage || isPdf || isVideo) ? 'hidden' : 'flex'}`}>
          <Icon className="w-12 h-12 mb-2 opacity-50" />
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-border flex flex-col justify-center bg-card z-10">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm font-bold text-foreground truncate flex-1 min-w-0" title={file.name}>
            {file.name}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button 
              onClick={handleCopyUrl}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open(fileUrl, '_blank', 'noopener,noreferrer');
              }}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Open URL"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
            {currentView !== 'trash' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(file.id, 'file', isStarred);
                }}
                className={`p-1 hover:bg-accent rounded transition-colors ${isStarred ? 'text-yellow-400' : 'text-muted-foreground hover:text-foreground'}`}
                title="Star file"
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            )}
            <div onClick={e => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:outline-none flex-shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>
                <DropdownActions />
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground font-normal tracking-wide mt-0.5 truncate">
          {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
          {file.sizeBytes ? ` • ${formatBytes(file.sizeBytes)}` : ''}
          {dimensions ? ` • ${dimensions}` : ''}
        </div>
      </div>
        </div>
      </ContextMenuTrigger>
      <ContextActions />
    </ContextMenu>
  )
}
