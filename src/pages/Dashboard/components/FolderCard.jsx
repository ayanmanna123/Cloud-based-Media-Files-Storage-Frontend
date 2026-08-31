import { memo } from "react"
import { useTranslation } from "react-i18next"
import { TrashBinIcon } from "../../../components/TrashBinIcon"
import {
  Folder,
  FolderOpen,
  MoreVertical,
  Star,
  Users,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2
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

import { getItemPermissions } from "../../../lib/permissions"

function FolderCardComponent({ 
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
  onDoubleClick,
  isSharedProp
}) {
  const { t } = useTranslation()
  const isStarred = starredItems.includes(`folder_${folder.id}`)
  const isShared = isSharedProp || currentView === 'shared' || (folder.permission && folder.permission !== 'owner') || !!folder.sharedWithMe
  const perms = getItemPermissions(folder, currentView, isSharedProp)
  const isViewer = perms.isViewer
  
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
            <RotateCcw className="w-4 h-4 mr-2" /> {t("dashboard.restore")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDeleteForever(folder.id, 'folder')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <TrashBinIcon isOpen={true} className="w-4 h-4 mr-2" /> {t("dashboard.deleteForever")}
          </ContextMenuItem>
        </>
      ) : (
        <>
          <ContextMenuItem onClick={() => onToggleStar(folder.id, 'folder', isStarred)}>
            <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} /> 
            {isStarred ? t("dashboard.unstar") : t("dashboard.star")}
          </ContextMenuItem>
          <ContextMenuItem disabled={!perms.canShare} onClick={() => perms.canShare && setTimeout(() => onShare({ isOpen: true, resourceType: 'folder', resourceId: folder.id, resourceName: folder.name }), 0)}>
            <Users className="w-4 h-4 mr-2 text-blue-600" /> {t("dashboard.share")}
          </ContextMenuItem>
          <ContextMenuItem disabled={!perms.canRename} onClick={() => perms.canRename && setTimeout(() => onRename({ isOpen: true, id: folder.id, currentName: folder.name }), 0)}>
            <Edit2 className="w-4 h-4 mr-2" /> {t("dashboard.rename")}
          </ContextMenuItem>
          {currentView === 'secret' ? (
            <ContextMenuItem onClick={() => onHide(folder.id, false)}>
              <Eye className="w-4 h-4 mr-2 text-green-500" /> {t("dashboard.unhide")}
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => onHide(folder.id, true)}>
              <EyeOff className="w-4 h-4 mr-2 text-yellow-500" /> {t("dashboard.hide")}
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem 
            disabled={!perms.canDelete} 
            onClick={() => perms.canDelete && onDelete(folder.id)} 
            className={perms.canDelete ? "text-red-500 focus:text-red-500 focus:bg-red-50 group/del" : ""}
          >
            <TrashBinIcon className="w-4 h-4 mr-2" /> {t("dashboard.delete")}
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
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Folder className="w-8 h-8 text-blue-500 transition-all duration-300 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75 absolute inset-0" />
          <FolderOpen className="w-8 h-8 text-blue-500 transition-all duration-300 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-110 absolute inset-0" />
        </div>
        
        <div className="flex items-center gap-1">
          {isSelected && (
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-500/20" />
          )}
          <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currentView === 'trash' ? (
                  <>
                    <DropdownMenuItem onClick={() => onRestore(folder.id, 'folder')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                      <RotateCcw className="w-4 h-4 mr-2" /> {t("dashboard.restore")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteForever(folder.id, 'folder')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <TrashBinIcon isOpen={true} className="w-4 h-4 mr-2" /> {t("dashboard.deleteForever")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => onToggleStar(folder.id, 'folder', isStarred)}>
                      <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} /> 
                      {isStarred ? t("dashboard.unstar") : t("dashboard.star")}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!perms.canShare} onClick={() => perms.canShare && setTimeout(() => onShare({ isOpen: true, resourceType: 'folder', resourceId: folder.id, resourceName: folder.name }), 0)}>
                      <Users className="w-4 h-4 mr-2 text-blue-600" /> {t("dashboard.share")}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!perms.canRename} onClick={() => perms.canRename && setTimeout(() => onRename({ isOpen: true, id: folder.id, currentName: folder.name }), 0)}>
                      <Edit2 className="w-4 h-4 mr-2" /> {t("dashboard.rename")}
                    </DropdownMenuItem>
                    {currentView === 'secret' ? (
                      <DropdownMenuItem onClick={() => setTimeout(() => onHide(folder.id, false), 0)}>
                        <Eye className="w-4 h-4 mr-2 text-green-500" /> {t("dashboard.unhide")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => setTimeout(() => onHide(folder.id, true), 0)}>
                        <EyeOff className="w-4 h-4 mr-2 text-yellow-500" /> {t("dashboard.hide")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      disabled={!perms.canDelete} 
                      onClick={() => perms.canDelete && setTimeout(() => onDelete(folder.id), 0)} 
                      className={perms.canDelete ? "text-red-500 focus:text-red-500 focus:bg-red-50" : ""}
                    >
                      <TrashBinIcon className="w-4 h-4 mr-2" /> {t("dashboard.delete")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate pr-2" title={folder.name}>{folder.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {(() => {
            if (folder.fileCount === undefined && folder.folderCount === undefined) {
              return t("dashboard.itemFolder");
            }
            const parts = [];
            if (folder.folderCount && folder.folderCount > 0) {
              parts.push(`${folder.folderCount} ${folder.folderCount > 1 ? t("dashboard.itemFolders") : t("dashboard.itemFolder")}`);
            }
            if (folder.fileCount && folder.fileCount > 0) {
              parts.push(`${folder.fileCount} ${folder.fileCount > 1 ? t("dashboard.itemFiles") : t("dashboard.itemFile")}`);
            }
            if (parts.length === 0) {
              return "Empty";
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

export const FolderCard = memo(FolderCardComponent, (prevProps, nextProps) => {
  const prevIsStarred = (prevProps.starredItems || []).includes(`folder_${prevProps.folder?.id}`);
  const nextIsStarred = (nextProps.starredItems || []).includes(`folder_${nextProps.folder?.id}`);

  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.currentView === nextProps.currentView &&
    prevIsStarred === nextIsStarred &&
    prevProps.folder?.id === nextProps.folder?.id &&
    prevProps.folder?.name === nextProps.folder?.name &&
    prevProps.folder?.updatedAt === nextProps.folder?.updatedAt &&
    prevProps.folder?.fileCount === nextProps.folder?.fileCount &&
    prevProps.folder?.totalSize === nextProps.folder?.totalSize &&
    prevProps.folder?.isHidden === nextProps.folder?.isHidden
  );
});
