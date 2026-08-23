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
  Clock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

const getFileIcon = (filename) => {
  if (!filename) return FileText
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return FileImage
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return FileVideo
  if (['csv', 'xlsx', 'xls'].includes(ext)) return FileSpreadsheet
  return FileText
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
  onOpenVersionHistory
}) {
  const Icon = getFileIcon(file.name)
  const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = file.name.match(/\.(pdf)$/i)
  const isVideo = file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)
  const isOfficeDoc = file.name.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i)
  const previewUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}?tr=w-400,h-300,c-at_max`
  const thumbnailUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}/ik-thumbnail.jpg?tr=w-400,h-300,c-at_max`
  const fileUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}`
  const isStarred = starredItems.includes(`file_${file.id}`)

  const handleCardClick = () => {
    if (isOfficeDoc) {
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
          <DropdownMenuItem onClick={() => onDownload(file.id, file.name)}>
            <Download className="w-4 h-4 mr-2" /> Download
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem onClick={() => onDownload(file.id, file.name)}>
            <Download className="w-4 h-4 mr-2" /> Download
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

  if (viewMode === "list") {
    return (
      <div 
        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="col-span-11 sm:col-span-6 md:col-span-5 flex items-center gap-3">
          <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{file.name}</span>
        </div>
        <div className="hidden sm:block sm:col-span-3 md:col-span-2 text-sm text-muted-foreground">me</div>
        <div className="hidden md:block md:col-span-3 text-sm text-muted-foreground">
          {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
        </div>
        <div className="hidden sm:block sm:col-span-2 md:col-span-1 text-sm text-muted-foreground">
          {file.sizeBytes ? `${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : '--'}
        </div>
        <div className="col-span-1 flex justify-end gap-1">
          {currentView !== 'trash' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.id, 'file', isStarred);
              }}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${isStarred ? 'opacity-100 text-yellow-400' : 'opacity-0 group-hover:opacity-100 text-muted-foreground'}`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400 opacity-100' : ''}`} />
            </button>
          )}
          <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownActions />
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group border border-border rounded-xl bg-card hover:shadow-md transition-all cursor-pointer flex flex-col relative overflow-hidden h-48"
      onClick={handleCardClick}
    >
      <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden relative">
        {(isImage || isPdf || isVideo) ? (
          <>
            <img 
              src={(isPdf || isVideo) ? thumbnailUrl : previewUrl} 
              alt={file.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-3 border-t border-border flex items-center justify-between bg-card z-10">
        <div className="flex items-center gap-2 truncate pr-2">
          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{file.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {currentView !== 'trash' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.id, 'file', isStarred);
              }}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${isStarred ? 'opacity-100 text-yellow-400' : 'opacity-0 group-hover:opacity-100 text-muted-foreground'}`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400 opacity-100' : ''}`} />
            </button>
          )}
          <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-shrink-0 -mr-2">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownActions />
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
