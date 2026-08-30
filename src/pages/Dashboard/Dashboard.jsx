import { useState, useRef, useMemo, useEffect, useCallback } from "react"
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  RotateCcw,
  Search,
  ShieldCheck,
  CheckSquare
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import JSZip from "jszip"
import { useDrive } from "../../hooks/useDrive"
import { UploadIcon } from "../../components/UploadIcon"
import { SortIcon } from "../../components/SortIcon"
import { getBulkPermissions, getItemPermissions } from "../../lib/permissions"
import { SearchIcon } from "../../components/SearchIcon"
import { useProgress } from "../../context/ProgressContext"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { SetSecretCodeModal } from "./components/SetSecretCodeModal"
import { sha256 } from "../../lib/utils"
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
import { LightboxModal } from "./components/LightboxModal"
import { DashboardSkeleton } from "./components/DashboardSkeleton"

export function Dashboard() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery, setSearchQuery } = useOutletContext() || { searchQuery: "", setSearchQuery: () => {} }
  const { user, login } = useAuth()

  const [isSetCodeModalOpen, setIsSetCodeModalOpen] = useState(false)
  const [isSubmittingCode, setIsSubmittingCode] = useState(false)
  const [pendingHideItem, setPendingHideItem] = useState(null)
  const [secretHash, setSecretHash] = useState(null)
  
  const currentView = location.pathname.split("/").pop()
  const driveId = currentView === "shared" ? "shared" : currentView === "recent" ? "recent" : currentView === "starred" ? "starred" : currentView === "trash" ? "trash" : id

  const { 
    folder, children, path, loading, error, starredItems,
    createFolder, renameFolder, deleteFolder, 
    uploadFile, renameFile, deleteFile, moveFile, downloadFile, fetchAllFolders,
    fetchShares, shareResource, revokeShare, searchUsers,
    fetchLinkShare, createLinkShare, deleteLinkShare, toggleStar,
    restoreItem, deleteForever,
    trackOpen, createBundleShare,
    copyFile, moveFolder, copyFolder, refresh,
    hideFolder, hideFile
  } = useDrive(driveId)

  const isSharedFolder = currentView === 'shared' || (!!folder?.permission && folder?.permission !== 'owner')
  const effectiveSharedRole = folder?.permission || (currentView === 'shared' ? 'viewer' : isSharedFolder)
  const isViewerFolder = folder?.permission === 'viewer' || (currentView === 'shared' && folder?.permission !== 'editor' && folder?.permission !== 'owner')

  const { startUpload, updateProgress, completeUpload } = useProgress()

  // Folder Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [renameModalData, setRenameModalData] = useState({ isOpen: false, id: null, currentName: "" })
  
  // File Modals
  const [renameFileModalData, setRenameFileModalData] = useState({ isOpen: false, id: null, currentName: "" })
  const [selectedItems, setSelectedItems] = useState([]);
  const [isMobileSelectMode, setIsMobileSelectMode] = useState(false);
  const [moveFileModalData, setMoveFileModalData] = useState({ isOpen: false, id: null, currentName: "", selectedFolderId: "root", isBulk: false, items: [] })
  const [allFolders, setAllFolders] = useState([])
  
  const isSelectionViewer = selectedItems.length > 0
    ? selectedItems.some(itemKey => {
        const [type, id] = itemKey.split('_');
        const item = type === 'folder' 
          ? children?.folders?.find(f => String(f.id) === String(id)) 
          : children?.files?.find(f => String(f.id) === String(id));
        if (!item) return isViewerFolder;
        if (item.permission === 'viewer') return true;
        if (item.permission === 'editor' || item.permission === 'owner') return false;
        return isViewerFolder;
      })
    : isViewerFolder;

  const bulkPerms = getBulkPermissions(selectedItems, children, currentView, effectiveSharedRole, user);
  
  const [shareModalData, setShareModalData] = useState({ isOpen: false, resourceType: null, resourceId: null, resourceName: "" })
  const [versionHistoryModalData, setVersionHistoryModalData] = useState({ isOpen: false, fileId: null, fileName: "", currentVersionId: null })
  const [editFileModalData, setEditFileModalData] = useState({ isOpen: false, file: null })
  const [lightboxData, setLightboxData] = useState({ isOpen: false, file: null })
  const [isNextUploadEncrypted, setIsNextUploadEncrypted] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortMethod, setSortMethod] = useState(() => {
    return localStorage.getItem("drive_sortMethod") || "name-asc"
  })

  // Clipboard & Toast State
  const [clipboard, setClipboard] = useState(() => {
    const saved = localStorage.getItem("drive_clipboard")
    return saved ? JSON.parse(saved) : { action: null, items: [] }
  })
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    localStorage.setItem("drive_clipboard", JSON.stringify(clipboard))
  }, [clipboard])

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    const computeHash = async () => {
      if (user?.secretCode) {
        const hash = await sha256(user.secretCode)
        setSecretHash(hash)
      } else {
        setSecretHash(null)
      }
    }
    computeHash()
  }, [user?.secretCode])

  useEffect(() => {
    const checkAccess = async () => {
      if (user?.secretCode) {
        const hash = await sha256(user.secretCode)
        if (id === hash) {
          const isUnlocked = sessionStorage.getItem(`secret_unlocked_${hash}`) === 'true'
          if (!isUnlocked) {
            showToast("Secret folder is locked. Please enter your secret code in the search bar.")
            navigate("/dashboard")
          }
        }
      }
    }
    checkAccess()
  }, [id, user?.secretCode, navigate])

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Upload Progress State
  const [uploadTasks, setUploadTasks] = useState([])
  const [isUploadToastExpanded, setIsUploadToastExpanded] = useState(true)
  const abortControllersRef = useRef({})

  // Marquee Drag Selection State & Refs
  const containerRef = useRef(null)
  const [selectionBox, setSelectionBox] = useState(null)
  const isMouseDownRef = useRef(false)
  const dragStartPosRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 })
  const initialSelectedItemsRef = useRef([])
  const cachedItemsRef = useRef([])
  const containerRectRef = useRef(null)
  const latestMousePosRef = useRef({ clientX: 0, clientY: 0, isCtrl: false, isMeta: false, isShift: false })
  const rafPendingRef = useRef(false)
  const rafIdRef = useRef(null)

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

  useEffect(() => {
    if (isUploading) {
      startUpload();
    } else {
      completeUpload();
    }
  }, [isUploading]);

  useEffect(() => {
    if (isUploading && uploadTasks.length > 0) {
      const totalSize = uploadTasks.reduce((sum, t) => sum + (t.totalSize || 0), 0);
      const totalLoaded = uploadTasks.reduce((sum, t) => sum + (t.loaded || 0), 0);
      if (totalSize > 0) {
        updateProgress((totalLoaded / totalSize) * 100);
      }
    }
  }, [uploadTasks, isUploading]);

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
        if (folder?.permission === 'viewer') {
          showToast("you not access to edite this folder");
          return;
        }
        if (currentView !== 'shared' && currentView !== 'recent' && currentView !== 'starred' && currentView !== 'trash') {
          fileInputRef.current?.click();
        }
      }

      // New Folder: Shift+N
      if (e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (folder?.permission === 'viewer') {
          showToast("you not access to edite this folder");
          return;
        }
        if (currentView !== 'shared' && currentView !== 'recent' && currentView !== 'starred' && currentView !== 'trash') {
          setIsCreateModalOpen(true);
        }
      }

      // Upload Folder: Shift+F
      if (e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (folder?.permission === 'viewer') {
          showToast("you not access to edite this folder");
          return;
        }
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

      // Copy: Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedItems.length > 0 && currentView !== 'trash') {
          e.preventDefault();
          setClipboard({ action: 'copy', items: selectedItems });
          showToast(`Copied ${selectedItems.length} items to clipboard`);
        }
      }

      // Cut: Ctrl+X / Cmd+X
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        if (selectedItems.length > 0 && currentView !== 'trash' && !isSharedFolder) {
          e.preventDefault();
          setClipboard({ action: 'cut', items: selectedItems });
          showToast(`Cut ${selectedItems.length} items to clipboard`);
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
    
    // Paste handler needs current state of clipboard, so we define it below and attach it separately or just use an effect that has dependencies.
    // However, the event listener here has clipboard as a dependency now.
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, currentView, selectedItems, clipboard]);

  useEffect(() => {
    const handlePasteKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (folder?.permission === 'viewer') {
          e.preventDefault();
          showToast("you not access to edite this folder");
          return;
        }
        if (currentView !== 'trash' && currentView !== 'recent' && currentView !== 'starred' && currentView !== 'shared') {
          e.preventDefault();
          handlePaste();
        }
      }
    };
    window.addEventListener('keydown', handlePasteKey);
    return () => window.removeEventListener('keydown', handlePasteKey);
  }, [clipboard, id, currentView]);

  const handlePaste = async () => {
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
    if (!clipboard.action || clipboard.items.length === 0) return;
    
    setIsSubmitting(true);
    const targetFolderId = id === "root" || !id ? null : id; 
    
    try {
      const promises = clipboard.items.map(item => {
        const [type, itemId] = item.split('_');
        if (clipboard.action === 'copy') {
          return type === 'file' ? copyFile(itemId, targetFolderId) : copyFolder(itemId, targetFolderId);
        } else if (clipboard.action === 'cut') {
          return type === 'file' ? moveFile(itemId, targetFolderId) : moveFolder(itemId, targetFolderId);
        }
      });
      
      await Promise.all(promises);
      showToast(`Successfully pasted ${clipboard.items.length} items`);
      
      if (clipboard.action === 'cut') {
        setClipboard({ action: null, items: [] });
      }
      
      refresh();
    } catch (err) {
      console.error("Paste failed", err);
      showToast("Failed to paste some items");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleItemClick = (e, id, type) => {
    e.stopPropagation();
    const itemKey = `${type}_${id}`;
    // If Ctrl/Meta key is pressed OR mobile selection mode is enabled, toggle selection
    if (e.ctrlKey || e.metaKey || isMobileSelectMode) {
      setSelectedItems(prev => prev.includes(itemKey) 
        ? prev.filter(k => k !== itemKey) 
        : [...prev, itemKey]);
    } else {
      setSelectedItems([itemKey]);
    }
  }

  const handleBackgroundClick = () => {
    setSelectedItems([]);
    setIsMobileSelectMode(false);
  }

  const handleMarqueeMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, input, textarea, a, [role="menuitem"], [role="dialog"], [data-no-drag]')) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX - rect.left + container.scrollLeft;
    const startY = e.clientY - rect.top + container.scrollTop;

    isMouseDownRef.current = true;
    dragStartPosRef.current = { 
      x: startX, 
      y: startY, 
      clientX: e.clientX, 
      clientY: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop
    };
    containerRectRef.current = rect;

    // Cache item layout bounding boxes once on mousedown
    const itemElements = container.querySelectorAll('[data-item-key]');
    cachedItemsRef.current = Array.from(itemElements).map(el => {
      const itemRect = el.getBoundingClientRect();
      return {
        key: el.getAttribute('data-item-key'),
        rect: {
          left: itemRect.left,
          top: itemRect.top,
          right: itemRect.right,
          bottom: itemRect.bottom,
        }
      };
    });

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      initialSelectedItemsRef.current = [...selectedItems];
    } else {
      if (!e.target.closest('[data-item-key]')) {
        setSelectedItems([]);
        initialSelectedItemsRef.current = [];
      } else {
        initialSelectedItemsRef.current = [...selectedItems];
      }
    }
  };

  const updateMarqueeSelection = useCallback(() => {
    rafPendingRef.current = false;
    if (!isMouseDownRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const { clientX, clientY, isCtrl, isMeta, isShift } = latestMousePosRef.current;
    const rect = containerRectRef.current || container.getBoundingClientRect();

    const currentX = clientX - rect.left + container.scrollLeft;
    const currentY = clientY - rect.top + container.scrollTop;

    const startX = dragStartPosRef.current.x;
    const startY = dragStartPosRef.current.y;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    if (width < 4 && height < 4 && !selectionBox) {
      return;
    }

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    setSelectionBox({ left, top, width, height });

    const boxViewportLeft = Math.min(dragStartPosRef.current.clientX, clientX);
    const boxViewportTop = Math.min(dragStartPosRef.current.clientY, clientY);
    const boxViewportRight = Math.max(dragStartPosRef.current.clientX, clientX);
    const boxViewportBottom = Math.max(dragStartPosRef.current.clientY, clientY);

    const scrollDeltaX = container.scrollLeft - (dragStartPosRef.current.scrollLeft || 0);
    const scrollDeltaY = container.scrollTop - (dragStartPosRef.current.scrollTop || 0);

    const selectedKeys = new Set(initialSelectedItemsRef.current);
    const items = cachedItemsRef.current || [];

    for (let i = 0; i < items.length; i++) {
      const { key: itemKey, rect: itemRect } = items[i];
      const itemLeft = itemRect.left - scrollDeltaX;
      const itemRight = itemRect.right - scrollDeltaX;
      const itemTop = itemRect.top - scrollDeltaY;
      const itemBottom = itemRect.bottom - scrollDeltaY;

      const isIntersecting = !(
        itemRight < boxViewportLeft ||
        itemLeft > boxViewportRight ||
        itemBottom < boxViewportTop ||
        itemTop > boxViewportBottom
      );

      if (isIntersecting) {
        selectedKeys.add(itemKey);
      } else if (!isCtrl && !isMeta && !isShift) {
        selectedKeys.delete(itemKey);
      }
    }

    setSelectedItems(Array.from(selectedKeys));
  }, [selectionBox]);

  const handleMarqueeMouseMove = useCallback((e) => {
    if (!isMouseDownRef.current) return;

    latestMousePosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      isCtrl: e.ctrlKey,
      isMeta: e.metaKey,
      isShift: e.shiftKey
    };

    if (!rafPendingRef.current) {
      rafPendingRef.current = true;
      rafIdRef.current = requestAnimationFrame(updateMarqueeSelection);
    }
  }, [updateMarqueeSelection]);

  const handleMarqueeMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    rafPendingRef.current = false;
    setSelectionBox(null);
  }, []);

  useEffect(() => {
    const onGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        rafPendingRef.current = false;
        setSelectionBox(null);
      }
    };
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', onGlobalMouseUp);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleBulkDownload = async () => {
    if (selectedItems.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const zip = new JSZip();
      let hasFiles = false;

      // Helper function to recursively add folder contents to zip
      const addFolderToZip = async (folderId, folderZipPath) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/folders/${folderId}`, { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        
        // Add immediate files
        if (data.children && data.children.files) {
          for (const file of data.children.files) {
            const url = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}`;
            const fileRes = await fetch(url);
            if (fileRes.ok) {
              const blob = await fileRes.blob();
              folderZipPath.file(file.name, blob);
              hasFiles = true;
            }
          }
        }
        
        // Add subfolders (recursive)
        if (data.children && data.children.folders) {
          for (const subfolder of data.children.folders) {
            const subZipPath = folderZipPath.folder(subfolder.name);
            await addFolderToZip(subfolder.id, subZipPath);
          }
        }
      };

      // Process selected items
      for (const itemId of selectedItems) {
        const [type, actualId] = itemId.split('_');
        
        if (type === 'file') {
          const file = children.files.find(f => f.id === actualId);
          if (file) {
            const url = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}`;
            const fileRes = await fetch(url);
            if (fileRes.ok) {
              const blob = await fileRes.blob();
              zip.file(file.name, blob);
              hasFiles = true;
            }
          }
        } else if (type === 'folder') {
          const folder = children.folders.find(f => f.id === actualId);
          if (folder) {
            const folderZipPath = zip.folder(folder.name);
            await addFolderToZip(actualId, folderZipPath);
          }
        }
      }

      if (hasFiles) {
        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `CloudBox_Download_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 100);
      } else {
        alert("No files found to download.");
      }
    } catch (err) {
      console.error("Bulk download failed", err);
      alert("Failed to create ZIP archive. Some files may be inaccessible.");
    } finally {
      setIsSubmitting(false);
      setSelectedItems([]);
    }
  }

  const handleBulkDelete = async () => {
    if (isSelectionViewer) {
      showToast("you not access to edit this folder")
      return
    }
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
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
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
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
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
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
    if (confirm("Are you sure you want to delete this folder?")) {
      try {
        await deleteFolder(folderId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleFileUpload = async (files, targetFolderIdOverride = undefined, targetFileIdOverride = null, isEncryptedOverride = false) => {
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
    if (!files || files.length === 0) return
    setIsUploading(true)
    
    const shouldEncrypt = isEncryptedOverride || isNextUploadEncrypted || currentView === 'secret' || id === 'secret';
    // Reset one-time encrypt flag
    setIsNextUploadEncrypted(false);

    const newTasks = Array.from(files).map(f => {
      const isTooLarge = f.size > 20 * 1024 * 1024;
      return { 
        id: Math.random().toString(36).substring(2, 9), 
        name: f.name + (shouldEncrypt ? ' 🔒' : ''), 
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
          await uploadFile(file, controller.signal, targetFolderIdOverride, targetFileIdOverride, onProgress, shouldEncrypt)
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
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
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

  const handleRenameFile = async (e, overrideName) => {
    e?.preventDefault()
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
    const nameToUse = (typeof overrideName === 'string' && overrideName.trim()) 
      ? overrideName.trim() 
      : renameFileModalData.currentName.trim()
    if (!nameToUse) return
    setIsSubmitting(true)
    try {
      await renameFile(renameFileModalData.id, nameToUse)
      setRenameFileModalData({ isOpen: false, id: null, currentName: "" })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (folder?.permission === 'viewer') {
      showToast("you not access to edite this folder")
      return
    }
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        await deleteFile(fileId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleHideFolder = async (folderId, isHidden) => {
    if (isHidden && !user?.secretCode) {
      setPendingHideItem({ id: folderId, type: 'folder' })
      setIsSetCodeModalOpen(true)
    } else {
      try {
        await hideFolder(folderId, isHidden)
        showToast(isHidden ? "Folder hidden successfully" : "Folder unhidden successfully")
      } catch (err) {
        console.error(err)
        alert("Failed to hide folder: " + err.message)
      }
    }
  }

  const handleHideFile = async (fileId, isHidden) => {
    if (isHidden && !user?.secretCode) {
      setPendingHideItem({ id: fileId, type: 'file' })
      setIsSetCodeModalOpen(true)
    } else {
      try {
        await hideFile(fileId, isHidden)
        showToast(isHidden ? "File hidden successfully" : "File unhidden successfully")
      } catch (err) {
        console.error(err)
        alert("Failed to hide file: " + err.message)
      }
    }
  }

  const handleSetSecretCode = async (newCode) => {
    setIsSubmittingCode(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/secret-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secretCode: newCode })
      })
      if (res.ok) {
        login({ ...user, secretCode: newCode })
        setIsSetCodeModalOpen(false)
        showToast("Secret code configured successfully!")

        // Execute pending hide action if any
        if (pendingHideItem) {
          const { id, type } = pendingHideItem
          if (type === 'folder') {
            await hideFolder(id, true)
            showToast("Folder hidden successfully")
          } else {
            await hideFile(id, true)
            showToast("File hidden successfully")
          }
          setPendingHideItem(null)
        }
      } else {
        alert("Failed to set secret code")
      }
    } catch (err) {
      console.error(err)
      alert("Error setting secret code: " + err.message)
    } finally {
      setIsSubmittingCode(false)
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

  const handleMakeCopy = async (file) => {
    try {
      const targetFolderId = (currentView === 'shared' || currentView === 'starred' || currentView === 'recent') ? null : (id || null);
      const newCopy = await copyFile(file.id, targetFolderId);
      showToast(`Created copy: ${newCopy.name}`);
      if (refresh) refresh();
    } catch (err) {
      console.error('Copy file error:', err);
      showToast(err.message || 'Failed to create copy');
    }
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return FileText
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|heic|heif)$/i)) return FileImage
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

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
        Error loading drive: {error}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="max-w-6xl mx-auto space-y-6 pb-8 relative min-h-[80vh] select-none"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseDown={handleMarqueeMouseDown}
      onMouseMove={handleMarqueeMouseMove}
      onMouseUp={handleMarqueeMouseUp}
    >
      {/* Marquee Drag Selection Box */}
      {selectionBox && (
        <div 
          className="absolute bg-blue-500/20 border border-blue-500/80 rounded pointer-events-none z-40 transition-none"
          style={{
            left: `${selectionBox.left}px`,
            top: `${selectionBox.top}px`,
            width: `${selectionBox.width}px`,
            height: `${selectionBox.height}px`,
          }}
        />
      )}
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
          {t("dashboard.myDrive")}
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
        <h1 className="text-2xl font-semibold tracking-tight">
          {(!folder || folder?.name === "My Drive") ? t("dashboard.myDrive") : folder.name}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Header 3-Dot (More Options) Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-10 w-10 border-input transition-all ${isMobileSelectMode ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600' : ''}`} 
                title="More Options"
              >
                <MoreVertical className="w-4 h-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => {
                  if (isMobileSelectMode) {
                    setIsMobileSelectMode(false);
                    setSelectedItems([]);
                  } else {
                    setIsMobileSelectMode(true);
                  }
                }}
                className="cursor-pointer font-medium"
              >
                <CheckSquare className="w-4 h-4 mr-2 text-blue-500" />
                {isMobileSelectMode ? "Exit Selection Mode" : "Select"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSelectAll} className="cursor-pointer">
                <CheckCircle2 className="w-4 h-4 mr-2 text-muted-foreground" />
                {t("dashboard.selectAll") || "Select All"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isMobileSelectMode && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsMobileSelectMode(false);
                setSelectedItems([]);
              }}
              className="h-10 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Done</span>
            </Button>
          )}

          <div className="flex bg-muted/50 p-1 rounded-md border border-border/50 items-center mr-1">
            <button 
              onClick={() => setViewMode("list")} 
              className={`group p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="List view"
            >
              <List className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            </button>
            <button 
              onClick={() => setViewMode("grid")} 
              className={`group p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>

          {currentView !== "recent" && (
            <DropdownMenu>
              <DropdownMenuTrigger className="group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
                <SortIcon className="w-4 h-4" />
                {t("dashboard.sort")}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortMethod("name-asc")}>Name (A-Z) {sortMethod === "name-asc" && "✓"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMethod("name-desc")}>Name (Z-A) {sortMethod === "name-desc" && "✓"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMethod("date-desc")}>Newest First {sortMethod === "date-desc" && "✓"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMethod("date-asc")}>Oldest First {sortMethod === "date-asc" && "✓"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMethod("size-desc")}>Size (Largest) {sortMethod === "size-desc" && "✓"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {currentView !== "shared" && currentView !== "recent" && currentView !== "starred" && currentView !== "trash" && currentView !== "secret" && currentView !== secretHash && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="group gap-2 border-emerald-500/40 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium"
                    disabled={isUploading}
                    title="Upload File"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                    <span className="hidden sm:inline">{t("dashboard.upload")}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem 
                    onClick={() => {
                      setIsNextUploadEncrypted(false);
                      if (window.innerWidth < 640) {
                        showToast("Mobile Tip: In Files App, tap '...' → 'Select' to pick multiple files");
                      }
                      setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                    className="group/item cursor-pointer"
                  >
                    <UploadIcon className="w-4 h-4 mr-2" groupHoverClass="group-hover/item:-translate-y-1" />
                    {t("dashboard.standardUpload")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setIsNextUploadEncrypted(true);
                      if (window.innerWidth < 640) {
                        showToast("Mobile Tip: In Files App, tap '...' → 'Select' to pick multiple files");
                      }
                      setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                    className="cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t("dashboard.encryptedUpload")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="group gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                title="New Folder (Shift+N)"
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                <span className="hidden sm:inline">{t("dashboard.newFolder")}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Folders & Files Content / Skeleton */}
      {loading ? (
        <DashboardSkeleton viewMode={viewMode} />
      ) : (
        <>
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-sm font-medium text-muted-foreground shrink-0">{t("dashboard.folders")} ({filteredFolders.length})</h2>
                <div className="relative flex-1 max-w-[200px] sm:hidden">
                  <SearchIcon isSearching={!!searchQuery} className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input 
                    type="text" 
                    placeholder={t("dashboard.mobileSearchPlaceholder")} 
                    className="pl-8 h-8 text-xs bg-muted/40 border-border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFolders.map((f) => (
                  <FolderCard
                    key={f.id}
                    folder={f}
                    currentView={currentView === secretHash ? 'secret' : currentView}
                    isSharedProp={f.permission || effectiveSharedRole}
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
                    onHide={handleHideFolder}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Files Section */}
          {filteredFiles.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-sm font-medium text-muted-foreground shrink-0">{t("dashboard.files")} ({filteredFiles.length})</h2>
                {filteredFolders.length === 0 && (
                  <div className="relative flex-1 max-w-[200px] sm:hidden">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input 
                      type="text" 
                      placeholder="Search..." 
                      className="pl-8 h-8 text-xs bg-muted/40 border-border rounded-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              {viewMode === "list" ? (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Table Header */}
                  <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                    <div className="flex-1 min-w-0">Name</div>
                    <div className="hidden sm:block w-32 shrink-0">Owner</div>
                    <div className="hidden md:block w-32 shrink-0">Last modified</div>
                    <div className="hidden sm:block w-20 shrink-0">Size</div>
                    <div className="w-8 shrink-0"></div>
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
                          currentView={currentView === secretHash ? 'secret' : currentView}
                          isSharedProp={file.permission || effectiveSharedRole}
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
                          onMakeCopy={handleMakeCopy}
                          onRestore={restoreItem}
                          onDeleteForever={deleteForever}
                          onOpenVersionHistory={setVersionHistoryModalData}
                          onEdit={(file) => setEditFileModalData({ isOpen: true, file })}
                          onPreview={(file) => setLightboxData({ isOpen: true, file })}
                          onHide={handleHideFile}
                          showToast={showToast}
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
                        currentView={currentView === secretHash ? 'secret' : currentView}
                        isSharedProp={file.permission || effectiveSharedRole}
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
                        onMakeCopy={handleMakeCopy}
                        onRestore={restoreItem}
                        onDeleteForever={deleteForever}
                        onOpenVersionHistory={setVersionHistoryModalData}
                        onEdit={(file) => setEditFileModalData({ isOpen: true, file })}
                        onPreview={(file) => setLightboxData({ isOpen: true, file })}
                        onHide={handleHideFile}
                        showToast={showToast}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-xl">
              <FolderOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">This folder is empty</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                Upload files or create new folders to get started.
              </p>
            </div>
          )}
        </>
      )}

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100vw-1.5rem)] bg-popover/95 backdrop-blur-md text-popover-foreground border border-border shadow-2xl rounded-2xl sm:rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 md:gap-3 z-50 animate-in slide-in-from-bottom-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-xs sm:text-sm font-semibold pl-1 pr-2 border-r border-border shrink-0 whitespace-nowrap">
            {selectedItems.length} <span className="hidden sm:inline">{t("dashboard.selected")}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleSelectAll} title="Select All (Ctrl+A)" className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 whitespace-nowrap">
            <span className="hidden sm:inline">{t("dashboard.selectAll")}</span>
            <span className="sm:hidden">{t("dashboard.selectAll")}</span>
          </Button>
          <div className="w-px h-4 bg-border shrink-0 hidden sm:block"></div>
          {currentView === 'trash' ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleBulkRestore} className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 whitespace-nowrap">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> {t("dashboard.restore")}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBulkDeleteForever} className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 whitespace-nowrap" title="Delete Forever (Delete)">
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">{t("dashboard.deleteForever")}</span><span className="sm:hidden">{t("dashboard.delete")}</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleBulkDownload} title="Download as ZIP (Shift+D)" className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 whitespace-nowrap">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />} {t("dashboard.download")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={!bulkPerms.canShare} 
                onClick={() => {
                  if (!bulkPerms.canShare) return;
                  if (selectedItems.length === 1) {
                    const id = selectedItems[0];
                    const type = id.startsWith('folder_') ? 'folder' : 'file';
                    const actualId = id.split('_')[1];
                    const item = (type === 'folder' ? children.folders : children.files).find(f => f.id === actualId);
                    setShareModalData({ isOpen: true, resourceType: type, resourceId: actualId, resourceName: item?.name });
                  } else {
                    const fileIds = selectedItems.filter(id => id.startsWith('file_')).map(id => id.split('_')[1]);
                    if (fileIds.length > 0) {
                      setShareModalData({ isOpen: true, resourceType: 'bundle', resourceId: fileIds, resourceName: `${fileIds.length} items` });
                    }
                  }
                }} 
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 whitespace-nowrap"
                title={!bulkPerms.canShare ? "Sharing is disabled for shared items" : "Share"}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> {t("dashboard.share")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={!bulkPerms.canMove} 
                onClick={() => {
                  if (!bulkPerms.canMove) return;
                  handleBulkMove();
                }} 
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 whitespace-nowrap"
                title={!bulkPerms.canMove ? "Moving is disabled for shared items" : "Move"}
              >
                <FolderInput className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> {t("dashboard.move")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={!bulkPerms.canDelete}
                onClick={() => {
                  if (!bulkPerms.canDelete) return;
                  handleBulkDelete();
                }} 
                className={`h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0 whitespace-nowrap ${!bulkPerms.canDelete ? "" : "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"}`}
                title={!bulkPerms.canDelete ? "Delete is disabled for viewers" : "Delete (Delete / Backspace)"}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> {t("dashboard.delete")}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-card text-card-foreground border border-border px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5 slide-in-from-right-5 fade-in duration-300 flex items-center gap-3 max-w-sm">
          {toastMessage.toLowerCase().includes("not access") || toastMessage.toLowerCase().includes("failed") || toastMessage.toLowerCase().includes("unauthorized") ? (
            <XCircle className="w-5 h-5 text-destructive shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <div className="flex-1 text-sm font-medium leading-normal">
            {toastMessage}
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="w-4 h-4" />
          </button>
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
        onSave={(file, folderId, fileId, isEncrypted) => handleFileUpload([file], folderId, fileId, isEncrypted)}
      />

      <LightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ isOpen: false, file: null })}
        file={lightboxData.file}
        files={filteredFiles}
        onNavigate={(file) => setLightboxData({ isOpen: true, file })}
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
        useDrive={{ fetchShares, shareResource, revokeShare, searchUsers, fetchLinkShare, createLinkShare, deleteLinkShare, createBundleShare }}
      />
      <SetSecretCodeModal
        isOpen={isSetCodeModalOpen}
        onOpenChange={setIsSetCodeModalOpen}
        onSubmit={handleSetSecretCode}
        isSubmitting={isSubmittingCode}
      />
    </div>
  )
}
