import { useState, useRef, useMemo, useEffect } from "react"
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
  Users
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { ShareModal } from "../../components/ShareModal"

export function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery } = useOutletContext() || { searchQuery: "" }
  
  const currentView = location.pathname.split("/").pop()
  const driveId = currentView === "shared" ? "shared" : currentView === "recent" ? "recent" : id

  const { 
    folder, children, path, loading, error, 
    createFolder, renameFolder, deleteFolder, 
    uploadFile, renameFile, deleteFile, moveFile, downloadFile, fetchAllFolders,
    fetchShares, shareResource, revokeShare,
    fetchLinkShare, createLinkShare, deleteLinkShare
  } = useDrive(driveId)

  // Folder Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [renameModalData, setRenameModalData] = useState({ isOpen: false, id: null, currentName: "" })
  
  // File Modals
  const [renameFileModalData, setRenameFileModalData] = useState({ isOpen: false, id: null, currentName: "" })
  const [moveFileModalData, setMoveFileModalData] = useState({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })
  const [allFolders, setAllFolders] = useState([])
  
  const [shareModalData, setShareModalData] = useState({ isOpen: false, resourceType: null, resourceId: null, resourceName: "" })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortMethod, setSortMethod] = useState(() => {
    return localStorage.getItem("drive_sortMethod") || "name-asc"
  })

  const fileInputRef = useRef(null)
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
    localStorage.setItem("drive_viewMode", viewMode)
  }, [viewMode])

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

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    
    const newTasks = Array.from(files).map(f => ({ 
      id: Math.random().toString(36).substring(2, 9), 
      name: f.name, 
      status: 'uploading' 
    }))
    
    setUploadTasks(prev => [...prev, ...newTasks])
    setIsUploadToastExpanded(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const taskId = newTasks[i].id
        const controller = new AbortController()
        abortControllersRef.current[taskId] = controller

        try {
          await uploadFile(file, controller.signal)
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
      }
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
    setMoveFileModalData({ isOpen: true, id: fileId, currentName: fileName, selectedFolderId: "root" })
    const folders = await fetchAllFolders()
    // Filter out current folder if we are in one
    setAllFolders(folders.filter(f => f.id !== id))
  }

  const handleMoveFile = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const targetFolderId = moveFileModalData.selectedFolderId === "root" ? null : moveFileModalData.selectedFolderId
      await moveFile(moveFileModalData.id, targetFolderId)
      setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })
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
  }, [children?.folders, searchQuery, sortMethod])

  const filteredFiles = useMemo(() => {
    if (!children?.files) return []
    let result = children.files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
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
  }, [children?.files, searchQuery, sortMethod])

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
      {uploadTasks.length > 0 && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-50 flex flex-col transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/80 backdrop-blur-sm border-b border-border">
            <span className="font-semibold text-sm text-foreground">
              {uploadTasks.filter(t => t.status === 'uploading').length > 0 
                ? `Uploading ${uploadTasks.filter(t => t.status === 'uploading').length} item${uploadTasks.filter(t => t.status === 'uploading').length > 1 ? 's' : ''}` 
                : `${uploadTasks.filter(t => t.status === 'completed').length} upload${uploadTasks.filter(t => t.status === 'completed').length > 1 ? 's' : ''} complete`}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-background/80" onClick={() => setIsUploadToastExpanded(!isUploadToastExpanded)}>
                {isUploadToastExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground" onClick={() => setUploadTasks([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {isUploadToastExpanded && (
            <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
              {uploadTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3 truncate pr-4">
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-foreground/90">{task.name}</span>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-end min-w-[60px] gap-2">
                    {task.status === 'uploading' && (
                      <>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50/50" onClick={() => cancelUpload(task.id)}>Cancel</Button>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      </>
                    )}
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {task.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    {task.status === 'cancelled' && <span className="text-xs text-muted-foreground font-medium">Cancelled</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e.target.files)} 
        className="hidden" 
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

          {currentView !== "shared" && currentView !== "recent" && (
            <>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="gap-2"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload File
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
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
              <div 
                key={f.id} 
                onClick={() => navigate(`/dashboard/folder/${f.id}`)}
                className="group p-4 border border-border rounded-xl bg-card hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 relative"
              >
                <div className="flex justify-between items-start">
                  <FolderOpen className="w-8 h-8 text-blue-500" />
                  
                  {/* Context Menu inside folder card */}
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShareModalData({ isOpen: true, resourceType: 'folder', resourceId: f.id, resourceName: f.name })}>
                          <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShareModalData({ isOpen: true, resourceType: 'folder', resourceId: f.id, resourceName: f.name })}>
                          <Users className="w-4 h-4 mr-2 text-blue-600" /> Who has access
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRenameModalData({ isOpen: true, id: f.id, currentName: f.name })}>
                          <Edit2 className="w-4 h-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteFolder(f.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div>
                  <div className="font-medium truncate pr-6">{f.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Folder</div>
                </div>
              </div>
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
                    <div 
                      key={file.id} 
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group cursor-pointer"
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
                      <div className="col-span-1 flex justify-end">
                        <div onClick={e => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => downloadFile(file.id, file.name)}>
                                <Download className="w-4 h-4 mr-2" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShareModalData({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name })}>
                                <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShareModalData({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name })}>
                                <Users className="w-4 h-4 mr-2 text-blue-600" /> Who has access
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRenameFileModalData({ isOpen: true, id: file.id, currentName: file.name })}>
                                <Edit2 className="w-4 h-4 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openMoveFileModal(file.id, file.name)}>
                                <FolderInput className="w-4 h-4 mr-2" /> Move
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file.name)
                const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                const isPdf = file.name.match(/\.(pdf)$/i)
                const previewUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}?tr=w-400,h-300,c-at_max`
                // ImageKit requires appending /ik-thumbnail.jpg to the PDF path to extract the first page as an image
                const pdfPreviewUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}/ik-thumbnail.jpg?tr=w-400,h-300,c-at_max`

                return (
                  <div key={file.id} className="group border border-border rounded-xl bg-card hover:shadow-md transition-all cursor-pointer flex flex-col relative overflow-hidden h-48">
                    {/* Preview Area */}
                    <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden relative">
                       {(isImage || isPdf) ? (
                         <img 
                           src={isPdf ? pdfPreviewUrl : previewUrl} 
                           alt={file.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                           onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                           }}
                         />
                       ) : null}
                       <div className={`flex flex-col items-center justify-center text-muted-foreground w-full h-full absolute inset-0 ${(isImage || isPdf) ? 'hidden' : 'flex'}`}>
                         <Icon className="w-12 h-12 mb-2 opacity-50" />
                       </div>
                    </div>
                    {/* Details Area */}
                    <div className="p-3 border-t border-border flex items-center justify-between bg-card z-10">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      
                      {/* Context Menu */}
                      <div onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-shrink-0 -mr-2">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => downloadFile(file.id, file.name)}>
                              <Download className="w-4 h-4 mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShareModalData({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name })}>
                              <Users className="w-4 h-4 mr-2 text-blue-600" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShareModalData({ isOpen: true, resourceType: 'file', resourceId: file.id, resourceName: file.name })}>
                              <Users className="w-4 h-4 mr-2 text-blue-600" /> Who has access
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRenameFileModalData({ isOpen: true, id: file.id, currentName: file.name })}>
                              <Edit2 className="w-4 h-4 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openMoveFileModal(file.id, file.name)}>
                              <FolderInput className="w-4 h-4 mr-2" /> Move
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
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

      {/* Create Folder Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <form onSubmit={handleCreateFolder}>
            <DialogHeader>
              <DialogTitle>Create new folder</DialogTitle>
              <DialogDescription>
                Enter a name for your new folder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                autoFocus
                placeholder="Folder name" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newFolderName.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Modal */}
      <Dialog open={renameModalData.isOpen} onOpenChange={(open) => !open && setRenameModalData({ isOpen: false, id: null, currentName: "" })}>
        <DialogContent>
          <form onSubmit={handleRenameFolder}>
            <DialogHeader>
              <DialogTitle>Rename folder</DialogTitle>
              <DialogDescription>
                Enter a new name for the folder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                autoFocus
                placeholder="Folder name" 
                value={renameModalData.currentName}
                onChange={(e) => setRenameModalData(prev => ({ ...prev, currentName: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameModalData({ isOpen: false, id: null, currentName: "" })} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!renameModalData.currentName.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename File Modal */}
      <Dialog open={renameFileModalData.isOpen} onOpenChange={(open) => !open && setRenameFileModalData({ isOpen: false, id: null, currentName: "" })}>
        <DialogContent>
          <form onSubmit={handleRenameFile}>
            <DialogHeader>
              <DialogTitle>Rename file</DialogTitle>
              <DialogDescription>
                Enter a new name for the file.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                autoFocus
                placeholder="File name" 
                value={renameFileModalData.currentName}
                onChange={(e) => setRenameFileModalData(prev => ({ ...prev, currentName: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameFileModalData({ isOpen: false, id: null, currentName: "" })} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!renameFileModalData.currentName.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move File Modal */}
      <Dialog open={moveFileModalData.isOpen} onOpenChange={(open) => !open && setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })}>
        <DialogContent>
          <form onSubmit={handleMoveFile}>
            <DialogHeader>
              <DialogTitle>Move file</DialogTitle>
              <DialogDescription>
                Select a destination folder for '{moveFileModalData.currentName}'
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <select 
                value={moveFileModalData.selectedFolderId}
                onChange={(e) => setMoveFileModalData(prev => ({ ...prev, selectedFolderId: e.target.value }))}
                disabled={isSubmitting}
                className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              >
                <option value="root">My Drive (Root)</option>
                {allFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Move
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
