import { useState, useRef, useMemo, useEffect, useCallback } from "react"
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom"
import { 
  FolderOpen, 
  MoreVertical, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileVideo,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  ChevronRight,
  Home,
  Upload,
  UploadCloud,
  Download,
  FolderInput,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  X,
  LayoutGrid,
  List,
  Users,
  Star,
  RotateCcw
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useDrive } from "../../hooks/useDrive"
import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { ShareModal } from "../../components/ShareModal"

import { FolderCard } from "./components/FolderCard"
import { FileCard } from "./components/FileCard"
import { UploadProgress } from "./components/UploadProgress"
import { CreateFolderModal } from "./components/CreateFolderModal"
import { RenameFolderModal } from "./components/RenameFolderModal"
import { RenameFileModal } from "./components/RenameFileModal"
import { MoveFileModal } from "./components/MoveFileModal"
import { VersionHistoryModal } from "./components/VersionHistoryModal"
import { EditFileModal } from "./components/EditFileModal"

export function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery } = useOutletContext() || { searchQuery: "" }
  
  const currentView = location.pathname.split("/").pop()
  const driveId = currentView === "shared" ? "shared" : currentView === "recent" ? "recent" : currentView === "starred" ? "starred" : currentView === "trash" ? "trash" : id

  const { 
    folder, children, path, loading, error, starredItems,
    createFolder, renameFolder, deleteFolder, 
    uploadFile, renameFile, deleteFile, moveFile, downloadFile, fetchAllFolders,
    fetchShares, shareResource, revokeShare,
    fetchLinkShare, createLinkShare, deleteLinkShare, toggleStar,
    restoreItem, deleteForever,
    trackOpen
  } = useDrive(driveId)

  // Folder Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [renameModalData, setRenameModalData] = useState({ isOpen: false, id: null, currentName: "" })
  
  // File Modals
  const [renameFileModalData, setRenameFileModalData] = useState({ isOpen: false, id: null, currentName: "" })
  const [selectedItems, setSelectedItems] = useState([]);
  const [moveFileModalData, setMoveFileModalData] = useState({ isOpen: false, id: null, currentName: "", selectedFolderId: "root", isBulk: false, items: [] })
  const [allFolders, setAllFolders] = useState([])
  
  const [shareModalData, setShareModalData] = useState({ isOpen: false, resourceType: null, resourceId: null, resourceName: "" })
  const [versionHistoryModalData, setVersionHistoryModalData] = useState({ isOpen: false, fileId: null, fileName: "", currentVersionId: null })
  const [editFileModalData, setEditFileModalData] = useState({ isOpen: false, file: null })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortMethod, setSortMethod] = useState(() => {
    return localStorage.getItem("drive_sortMethod") || "name-asc"
  })

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Upload Progress State
  const [uploadTasks, setUploadTasks] = useState([])
  const [isUploadToastExpanded, setIsUploadToastExpanded] = useState(true)
  const abortControllersRef = useRef({})

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("drive_viewMode") || "grid"
  })

  // Persist preferences
  useEffect(() => {
    localStorage.setItem("drive_sortMethod", sortMethod)
  }, [sortMethod])

  useEffect(() => {
    if (driveId) {
      localStorage.setItem("drive_lastVisitedId", driveId)
      setSelectedItems([])
    }
  }, [driveId])

  useEffect(() => {
    const handleCreateFolder = () => setIsCreateModalOpen(true);
    const handleFileUpload = () => fileInputRef.current?.click();
    const handleFolderUpload = () => folderInputRef.current?.click();

    document.addEventListener('openCreateFolder', handleCreateFolder);
    document.addEventListener('triggerFileUpload', handleFileUpload);
    document.addEventListener('triggerFolderUpload', handleFolderUpload);

    return () => {
      document.removeEventListener('openCreateFolder', handleCreateFolder);
      document.removeEventListener('triggerFileUpload', handleFileUpload);
      document.removeEventListener('triggerFolderUpload', handleFolderUpload);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("drive_viewMode", viewMode)
  }, [viewMode])

  const handleSelectAll = useCallback(() => {
    const allFolderIds = (children?.folders || []).map(f => `folder_${f.id}`);
    const allFileIds = (children?.files || []).map(f => `file_${f.id}`);
    setSelectedItems([...allFolderIds, ...allFileIds]);
  }, [children]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Select All: Ctrl+A / Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      
      // Upload File: Shift+U
      if (e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        if (currentView !== 'shared' && currentView !== 'recent' && currentView !== 'starred' && currentView !== 'trash') {
          fileInputRef.current?.click();
        }
      }

      // New Folder: Shift+N
      if (e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (currentView !== 'shared' && currentView !== 'recent' && currentView !== 'starred' && currentView !== 'trash') {
          setIsCreateModalOpen(true);
        }
      }

      // Upload Folder: Shift+F
      if (e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (currentView !== 'shared' && currentView !== 'recent' && currentView !== 'starred' && currentView !== 'trash') {
          folderInputRef.current?.click();
        }
      }

      // Download Selected: Shift+D
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        if (selectedItems.length > 0 && currentView !== 'trash') {
          e.preventDefault();
          handleBulkDownload();
        }
      }

      // Delete Selected: Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItems.length > 0) {
          e.preventDefault();
          if (currentView === 'trash') {
            handleBulkDeleteForever();
          } else {
            handleBulkDelete();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, currentView, selectedItems]);

  const handleItemClick = (e, id, type) => {
    e.stopPropagation();
    const itemKey = `${type}_${id}`;
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev => prev.includes(itemKey) 
        ? prev.filter(k => k !== itemKey) 
        : [...prev, itemKey]);
    } else {
      setSelectedItems([itemKey]);
    }
  }

  const handleBackgroundClick = () => {
    setSelectedItems([]);
  }

  const handleBulkDownload = async () => {
    const fileIds = selectedItems.filter(id => id.startsWith('file_')).map(id => id.replace('file_', ''));
    if (fileIds.length === 0) return;
    for (const fileId of fileIds) {
      const file = children.files.find(f => f.id === fileId);
      if (file) {
        downloadFile(file.id, file.name);
      }
    }
    setSelectedItems([]);
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;
    setIsSubmitting(true);
    try {
      const deletePromises = selectedItems.map(item => {
        const [type, id] = item.split('_');
        if (type === 'file') return deleteFile(id);
        if (type === 'folder') return deleteFolder(id);
      });
      await Promise.all(deletePromises);
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBulkMove = async () => {
    const fileIds = selectedItems.filter(id => id.startsWith('file_'));
    if (fileIds.length === 0) return; // Only files can be moved
    const folders = await fetchAllFolders();
    setAllFolders(folders);
    setMoveFileModalData({ isOpen: true, isBulk: true, items: fileIds, selectedFolderId: "root" });
  }

  const handleBulkRestore = async () => {
    setIsSubmitting(true);
    try {
      const restorePromises = selectedItems.map(item => {
        const [type, id] = item.split('_');
        return restoreItem(id, type);
      });
      await Promise.all(restorePromises);
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBulkDeleteForever = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${selectedItems.length} items? This action cannot be undone.`)) return;
    setIsSubmitting(true);
    try {
      const deletePromises = selectedItems.map(item => {
        const [type, id] = item.split('_');
        return deleteForever(id, type);
      });
      await Promise.all(deletePromises);
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    setIsSubmitting(true)
    try {
      await createFolder(newFolderName)
      setNewFolderName("")
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRenameFolder = async (e) => {
    e.preventDefault()
    if (!renameModalData.currentName.trim()) return
    setIsSubmitting(true)
    try {
      await renameFolder(renameModalData.id, renameModalData.currentName)
      setRenameModalData({ isOpen: false, id: null, currentName: "" })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (confirm("Are you sure you want to delete this folder?")) {
      try {
        await deleteFolder(folderId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleFileUpload = async (files, targetFolderIdOverride = undefined, targetFileIdOverride = null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    
    const newTasks = Array.from(files).map(f => {
      const isTooLarge = f.size > 20 * 1024 * 1024;
      return { 
        id: Math.random().toString(36).substring(2, 9), 
        name: f.name, 
        status: isTooLarge ? 'error' : 'uploading',
        message: isTooLarge ? 'Max 20MB allowed' : undefined,
        progress: 0,
        speed: 0,
        timeRemaining: 0,
        loaded: 0,
        totalSize: f.size
      }
    })
    
    setUploadTasks(prev => [...prev, ...newTasks])
    setIsUploadToastExpanded(true)

    try {
      const uploadPromises = Array.from(files).map(async (file, i) => {
        const task = newTasks[i]
        const taskId = task.id
        
        if (task.status === 'error') {
          return; // Skip uploading this file since it's too large
        }

        const controller = new AbortController()
        abortControllersRef.current[taskId] = controller

        try {
          const onProgress = (stats) => {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...stats } : t));
          };
          await uploadFile(file, controller.signal, targetFolderIdOverride, targetFileIdOverride, onProgress)
          setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t))
        } catch (err) {
          if (err.name === 'AbortError') {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' } : t))
          } else {
            console.error(err)
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t))
          }
        } finally {
          delete abortControllersRef.current[taskId]
        }
      });
      
      await Promise.all(uploadPromises);
    } finally {
      setIsUploading(false)
    }
  }

  const handleFolderUploadSubmit = async (filesList) => {
    if (!filesList || filesList.length === 0) return
    setIsUploading(true)

    // The webkitRelativePath contains the path, e.g., "FolderName/subfolder/file.png"
    // We only want the root folder name.
    const firstPath = filesList[0].webkitRelativePath || ""
    const rootFolderName = firstPath.split('/')[0] || "New Folder Upload"

    let targetFolderId = null
    try {
      // 1. Create the root folder first
      const newFolder = await createFolder(rootFolderName)
      if (newFolder && newFolder.id) {
        targetFolderId = newFolder.id
      }
    } catch (err) {
      console.error("Failed to create folder for upload", err)
      setIsUploading(false)
      return
    }

    // 2. Proceed with file upload but override the target folder ID
    const newTasks = Array.from(filesList).map(f => {
      const isTooLarge = f.size > 20 * 1024 * 1024;
      return { 
        id: Math.random().toString(36).substring(2, 9), 
        name: f.name, 
        status: isTooLarge ? 'error' : 'uploading',
        message: isTooLarge ? 'Max 20MB allowed' : undefined,
        progress: 0,
        speed: 0,
        timeRemaining: 0,
        loaded: 0,
        totalSize: f.size
      }
    })
    
    setUploadTasks(prev => [...prev, ...newTasks])
    setIsUploadToastExpanded(true)

    try {
      const uploadPromises = Array.from(filesList).map(async (file, i) => {
        const task = newTasks[i]
        const taskId = task.id
        
        if (task.status === 'error') {
          return; // Skip uploading this file since it's too large
        }

        const controller = new AbortController()
        abortControllersRef.current[taskId] = controller

        try {
          // Pass the targetFolderId to uploadFile
          const onProgress = (stats) => {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...stats } : t));
          };
          await uploadFile(file, controller.signal, targetFolderId, null, onProgress)
          setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t))
        } catch (err) {
          if (err.name === 'AbortError') {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' } : t))
          } else {
            console.error(err)
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t))
          }
        } finally {
          delete abortControllersRef.current[taskId]
        }
      });

      await Promise.all(uploadPromises);
    } finally {
      setIsUploading(false)
    }
  }

  const cancelUpload = (taskId) => {
    if (abortControllersRef.current[taskId]) {
      abortControllersRef.current[taskId].abort()
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleRenameFile = async (e) => {
    e.preventDefault()
    if (!renameFileModalData.currentName.trim()) return
    setIsSubmitting(true)
    try {
      await renameFile(renameFileModalData.id, renameFileModalData.currentName)
      setRenameFileModalData({ isOpen: false, id: null, currentName: "" })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        await deleteFile(fileId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const openMoveFileModal = async (fileId, fileName) => {
    setMoveFileModalData({ isOpen: true, id: fileId, currentName: fileName, selectedFolderId: "root", isBulk: false, items: [] })
    const folders = await fetchAllFolders()
    // Filter out current folder if we are in one
    setAllFolders(folders.filter(f => f.id !== id))
  }

  const handleMoveFile = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (moveFileModalData.isBulk) {
        const movePromises = moveFileModalData.items.map(item => {
          const [type, id] = item.split('_');
          if (type === 'file') return moveFile(id, moveFileModalData.selectedFolderId);
        });
        await Promise.all(movePromises);
        setSelectedItems([]);
      } else {
        await moveFile(moveFileModalData.id, moveFileModalData.selectedFolderId)
      }
      setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root", isBulk: false, items: [] })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return FileText
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return FileImage
    if (fileName.match(/\.(mp4|webm|ogg)$/i)) return FileVideo
    if (fileName.match(/\.(csv|xls|xlsx)$/i)) return FileSpreadsheet
    return FileText
  }

  // Filter and sort logic
  const filteredFolders = useMemo(() => {
    if (!children?.folders) return []
    let result = children.folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (currentView === 'recent') return result;

    result.sort((a, b) => {
      switch (sortMethod) {
        case "name-asc": return a.name.localeCompare(b.name)
        case "name-desc": return b.name.localeCompare(a.name)
        case "date-desc": return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        case "date-asc": return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
        default: return 0
      }
    })
    return result
  }, [children.folders, searchQuery, sortMethod, currentView])

  const filteredFiles = useMemo(() => {
    if (!children?.files) return []
    let result = children.files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (currentView === 'recent') return result;

    result.sort((a, b) => {
      switch (sortMethod) {
        case "name-asc": return a.name.localeCompare(b.name)
        case "name-desc": return b.name.localeCompare(a.name)
        case "date-desc": return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        case "date-asc": return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
        case "size-desc": return (b.sizeBytes || 0) - (a.sizeBytes || 0)
        default: return 0
      }
    })
    return result
  }, [children.files, searchQuery, sortMethod, currentView])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
        Error loading drive: {error}
      </div>
    )
  }

  return (
    <div 
      className="max-w-6xl mx-auto space-y-6 pb-8 relative min-h-[80vh]"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleBackgroundClick}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-2xl pointer-events-none">
          <div className="text-center">
            <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-foreground">Drop files to upload</h3>
            <p className="text-muted-foreground mt-2">to {folder?.name || "My Drive"}</p>
          </div>
        </div>
      )}

      {/* Upload Progress Toast */}
      <UploadProgress 
        tasks={uploadTasks}
        isExpanded={isUploadToastExpanded}
        onToggleExpand={() => setIsUploadToastExpanded(!isUploadToastExpanded)}
        onClose={() => setUploadTasks([])}
        onCancel={cancelUpload}
      />

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e.target.files)} 
        className="hidden" 
        multiple
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={(e) => handleFolderUploadSubmit(e.target.files)} 
        className="hidden" 
        webkitdirectory="true"
        directory="true"
        multiple
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-muted-foreground overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
        <Link 
          to="/dashboard" 
          className="hover:text-foreground flex items-center transition-colors"
        >
          <Home className="w-4 h-4 mr-1.5" />
          My Drive
        </Link>
        
        {path && path.map((crumb, index) => (
          <div key={crumb.id || index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
            {index === path.length - 1 ? (
              <span className="text-foreground">{crumb.name}</span>
            ) : (
              <Link 
                to={`/dashboard/folder/${crumb.id}`}
                className="hover:text-foreground transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{folder?.name || "My Drive"}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted/50 p-1 rounded-md border border-border/50 items-center mr-1">
            <button 
              onClick={() => setViewMode("list")} 
              className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("grid")} 
              className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortMethod("name-asc")}>Name (A-Z) {sortMethod === "name-asc" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMethod("name-desc")}>Name (Z-A) {sortMethod === "name-desc" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMethod("date-desc")}>Newest First {sortMethod === "date-desc" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMethod("date-asc")}>Oldest First {sortMethod === "date-asc" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMethod("size-desc")}>Size (Largest) {sortMethod === "size-desc" && "✓"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentView !== "shared" && currentView !== "recent" && currentView !== "starred" && currentView !== "trash" && (
            <>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="gap-2"
                disabled={isUploading}
                title="Upload File (Shift+U)"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload File
              </Button>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                title="New Folder (Shift+N)"
              >
                <Plus className="w-4 h-4" />
                New Folder
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Folders Section */}
      {filteredFolders.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFolders.map((f) => (
              <FolderCard
                key={f.id}
                folder={f}
                currentView={currentView}
                starredItems={starredItems}
                isSelected={selectedItems.includes(`folder_${f.id}`)}
                onClick={(e) => handleItemClick(e, f.id, 'folder')}
                onDoubleClick={() => {
                  trackOpen(f.id, 'folder');
                  navigate(`/dashboard/folder/${f.id}`);
                }}
                onNavigate={(id) => {
                  trackOpen(id, 'folder');
                  navigate(`/dashboard/folder/${id}`);
                }}
                onToggleStar={toggleStar}
                onShare={setShareModalData}
                onRename={setRenameModalData}
                onDelete={handleDeleteFolder}
                onRestore={restoreItem}
                onDeleteForever={deleteForever}
              />
            ))}
          </div>
        </section>
      )}

      {/* Files Section */}
      {filteredFiles.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Files</h2>
          
          {viewMode === "list" ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-11 sm:col-span-6 md:col-span-5">Name</div>
                <div className="hidden sm:block sm:col-span-3 md:col-span-2">Owner</div>
                <div className="hidden md:block md:col-span-3">Last modified</div>
                <div className="hidden sm:block sm:col-span-2 md:col-span-1">Size</div>
                <div className="col-span-1"></div>
              </div>
              {/* Table Body */}
              <div className="divide-y divide-border">
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file.name)
                  return (
                    <FileCard
                      key={file.id}
                      file={file}
                      viewMode="list"
                      currentView={currentView}
                      starredItems={starredItems}
                      isSelected={selectedItems.includes(`file_${file.id}`)}
                      onClick={(e) => handleItemClick(e, file.id, 'file')}
                      onOpen={() => trackOpen(file.id, 'file')}
                      onToggleStar={toggleStar}
                      onShare={setShareModalData}
                      onRename={setRenameFileModalData}
                      onMove={openMoveFileModal}
                      onDelete={handleDeleteFile}
                      onDownload={downloadFile}
                      onRestore={restoreItem}
                      onDeleteForever={deleteForever}
                      onOpenVersionHistory={setVersionHistoryModalData}
                      onEdit={(file) => setEditFileModalData({ isOpen: true, file })}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => {
                return (
                  <FileCard 
                    key={file.id} 
                    file={file}
                    viewMode={viewMode}
                    currentView={currentView}
                    starredItems={starredItems}
                    isSelected={selectedItems.includes(`file_${file.id}`)}
                    onClick={(e) => handleItemClick(e, file.id, 'file')}
                    onOpen={() => trackOpen(file.id, 'file')}
                    onToggleStar={toggleStar}
                    onShare={setShareModalData}
                    onRename={setRenameFileModalData}
                    onMove={(id, name) => fetchAllFolders().then(folders => {
                      setAllFolders(folders);
                      setMoveFileModalData({ isOpen: true, id, currentName: name, selectedFolderId: "root", isBulk: false, items: [] });
                    })}
                    onDelete={handleDeleteFile}
                    onDownload={downloadFile}
                    onRestore={restoreItem}
                    onDeleteForever={deleteForever}
                    onOpenVersionHistory={setVersionHistoryModalData}
                    onEdit={(file) => setEditFileModalData({ isOpen: true, file })}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {filteredFolders.length === 0 && filteredFiles.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-xl">
          <FolderOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">This folder is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Upload files or create new folders to get started.
          </p>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-xl rounded-full px-4 py-2 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium pr-2 border-r border-border">{selectedItems.length} selected</span>
          <Button variant="ghost" size="sm" onClick={handleSelectAll} title="Select All (Ctrl+A)">Select All</Button>
          <div className="w-px h-4 bg-border mx-1"></div>
          {currentView === 'trash' ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleBulkRestore}>
                <RotateCcw className="w-4 h-4 mr-2" /> Restore
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBulkDeleteForever} className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete Forever (Delete)">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleBulkDownload} disabled={selectedItems.every(id => id.startsWith('folder_'))} title="Download (Shift+D)">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBulkMove} disabled={selectedItems.every(id => id.startsWith('folder_'))}>
                <FolderInput className="w-4 h-4 mr-2" /> Move
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete (Delete / Backspace)">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </>
          )}
        </div>
      )}

      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onSubmit={handleCreateFolder}
        isSubmitting={isSubmitting}
      />

      <RenameFolderModal
        renameModalData={renameModalData}
        setRenameModalData={setRenameModalData}
        onSubmit={handleRenameFolder}
        isSubmitting={isSubmitting}
      />

      <RenameFileModal
        renameFileModalData={renameFileModalData}
        setRenameFileModalData={setRenameFileModalData}
        onSubmit={handleRenameFile}
        isSubmitting={isSubmitting}
      />
      
      <EditFileModal 
        isOpen={editFileModalData.isOpen}
        onClose={() => setEditFileModalData({ isOpen: false, file: null })}
        file={editFileModalData.file}
        onSave={(file, folderId, fileId) => handleFileUpload([file], folderId, fileId)}
      />

      <VersionHistoryModal 
        isOpen={versionHistoryModalData.isOpen}
        onClose={() => setVersionHistoryModalData({ isOpen: false, fileId: null, fileName: "", currentVersionId: null })}
        fileId={versionHistoryModalData.fileId}
        fileName={versionHistoryModalData.fileName}
        currentVersionId={versionHistoryModalData.currentVersionId}
        onRestore={() => {
          // Refresh the folder to show the restored version
          window.location.reload(); 
        }}
      />

      <MoveFileModal
        moveFileModalData={moveFileModalData}
        setMoveFileModalData={setMoveFileModalData}
        allFolders={allFolders}
        onSubmit={handleMoveFile}
        isSubmitting={isSubmitting}
      />
      {/* Share Modal */}
      <ShareModal 
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ ...shareModalData, isOpen: false })}
        resourceType={shareModalData.resourceType}
        resourceId={shareModalData.resourceId}
        resourceName={shareModalData.resourceName}
        useDrive={{ fetchShares, shareResource, revokeShare, fetchLinkShare, createLinkShare, deleteLinkShare }}
      />
    </div>
  )
}
