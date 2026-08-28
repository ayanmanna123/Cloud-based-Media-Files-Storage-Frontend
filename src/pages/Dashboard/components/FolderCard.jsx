import {
  FolderOpen,
  MoreVertical,
  Star,
  Users,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff
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

export function FolderCard({ 
  folder, 
  currentView, 
  starredItems,
  onNavigate,
  onToggleStar, 
  onShare, 
  onRename, 
  onDelete, 
  onRestore, 
  onDeleteForever,
  onHide,
  isSelected,
  onClick,
  onDoubleClick
}) {
  const isStarred = starredItems.includes(`folder_${folder.id}`)
  
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ContextActions = () => (
    <ContextMenuContent className="w-48">
      {currentView === 'trash' ? (
        <>
          <ContextMenuItem onClick={() => onRestore(folder.id, 'folder')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
            <RotateCcw className="w-4 h-4 mr-2" /> Restore
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDeleteForever(folder.id, 'folder')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
          </ContextMenuItem>
        </>
      ) : (
        <>
          <ContextMenuItem onClick={() => onToggleStar(folder.id, 'folder', isStarred)}>
            <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} /> 
            {isStarred ? 'Unstar' : 'Star'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => onShare({ isOpen: true, resourceType: 'folder', resourceId: folder.id, resourceName: folder.name }), 0)}>
            <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => onRename({ isOpen: true, id: folder.id, currentName: folder.name }), 0)}>
            <Edit2 className="w-4 h-4 mr-2" /> Rename
          </ContextMenuItem>
          {currentView === 'secret' ? (
            <ContextMenuItem onClick={() => onHide(folder.id, false)}>
              <Eye className="w-4 h-4 mr-2 text-green-500" /> Unhide
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => onHide(folder.id, true)}>
              <EyeOff className="w-4 h-4 mr-2 text-yellow-500" /> Hide
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onDelete(folder.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          data-item-key={`folder_${folder.id}`}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          className={`group p-4 border rounded-xl bg-card hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 relative select-none ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-border'}`}
        >
      <div className="flex justify-between items-start">
        <FolderOpen className="w-8 h-8 text-blue-500" />
        
        <div className="flex items-center gap-1">
          {currentView !== 'shared' && (
            <div onClick={e => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentView === 'trash' ? (
                    <>
                      <DropdownMenuItem onClick={() => onRestore(folder.id, 'folder')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                        <RotateCcw className="w-4 h-4 mr-2" /> Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteForever(folder.id, 'folder')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => onToggleStar(folder.id, 'folder', isStarred)}>
                        <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} /> 
                        {isStarred ? 'Unstar' : 'Star'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeout(() => onShare({ isOpen: true, resourceType: 'folder', resourceId: folder.id, resourceName: folder.name }), 0)}>
                        <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeout(() => onRename({ isOpen: true, id: folder.id, currentName: folder.name }), 0)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      {currentView === 'secret' ? (
                        <DropdownMenuItem onClick={() => setTimeout(() => onHide(folder.id, false), 0)}>
                          <Eye className="w-4 h-4 mr-2 text-green-500" /> Unhide
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setTimeout(() => onHide(folder.id, true), 0)}>
                          <EyeOff className="w-4 h-4 mr-2 text-yellow-500" /> Hide
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTimeout(() => onDelete(folder.id), 0)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="font-medium truncate pr-6">{folder.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {(() => {
            if (folder.fileCount === undefined && folder.folderCount === undefined) {
              return 'Folder';
            }
            const parts = [];
            if (folder.folderCount && folder.folderCount > 0) {
              parts.push(`${folder.folderCount} folder${folder.folderCount > 1 ? 's' : ''}`);
            }
            if (folder.fileCount && folder.fileCount > 0) {
              parts.push(`${folder.fileCount} file${folder.fileCount > 1 ? 's' : ''}`);
            }
            if (parts.length === 0) {
              return 'Empty';
            }
            let label = parts.join(', ');
            if (folder.totalSize) {
              label += ` • ${formatBytes(folder.totalSize)}`;
            }
            return label;
          })()}
        </div>
      </div>
        </div>
      </ContextMenuTrigger>
      {currentView !== 'shared' && <ContextActions />}
    </ContextMenu>
  )
}
