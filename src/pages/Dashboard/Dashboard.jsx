import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
  Home
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

export function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { folder, children, path, loading, error, createFolder, renameFolder, deleteFolder } = useDrive(id)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [renameModalData, setRenameModalData] = useState({ isOpen: false, id: null, currentName: "" })

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

  const getFileIcon = (fileName) => {
    if (!fileName) return FileText
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return FileImage
    if (fileName.match(/\.(mp4|mov|avi|wmv)$/i)) return FileVideo
    if (fileName.match(/\.(xls|xlsx|csv)$/i)) return FileSpreadsheet
    return FileText
  }

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
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{folder?.name || "My Drive"}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Folders Section */}
      {children.folders.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {children.folders.map((f) => (
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
      {children.files.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Files</h2>
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground bg-muted/30">
              <div className="col-span-12 sm:col-span-6 md:col-span-5">Name</div>
              <div className="hidden sm:block sm:col-span-3 md:col-span-2">Owner</div>
              <div className="hidden md:block md:col-span-3">Last modified</div>
              <div className="hidden sm:block sm:col-span-2 md:col-span-1">Size</div>
              <div className="col-span-1 flex justify-end"></div>
            </div>
            
            <div className="flex flex-col divide-y divide-border">
              {children.files.map((file) => {
                const Icon = getFileIcon(file.name)
                return (
                  <div 
                    key={file.id} 
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div className="col-span-11 sm:col-span-6 md:col-span-5 flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <div className="hidden sm:block sm:col-span-3 md:col-span-2 text-sm text-muted-foreground">me</div>
                    <div className="hidden md:block md:col-span-3 text-sm text-muted-foreground">
                      {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
                    </div>
                    <div className="hidden sm:block sm:col-span-2 md:col-span-1 text-sm text-muted-foreground">
                      {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '--'}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {children.folders.length === 0 && children.files.length === 0 && (
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
    </div>
  )
}
