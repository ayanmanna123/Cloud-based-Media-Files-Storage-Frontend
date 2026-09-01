import React, { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { 
  Smartphone, 
  Laptop, 
  RefreshCw, 
  FolderOpen, 
  FileImage, 
  ArrowRight,
  Activity,
  Upload,
  Info,
  FolderPlus,
  Check,
  Plus,
  Trash2,
  FolderCheck
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useNavigate } from "react-router-dom"

// Helper to handle IndexedDB for Multiple DirectoryHandle storage
const savePairedFoldersList = async (foldersList) => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("DeviceSyncDB_Multi", 1)
      request.onupgradeneeded = (e) => {
        const db = e.target.result
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles")
        }
      }
      request.onsuccess = (e) => {
        const db = e.target.result
        const tx = db.transaction("handles", "readwrite")
        const store = tx.objectStore("handles")
        // Store serializable info & handles
        const payload = foldersList.map(f => ({
          id: f.id,
          name: f.name,
          handle: f.handle
        }))
        store.put(payload, "pairedFoldersList")
        tx.oncomplete = () => resolve(true)
      }
      request.onerror = () => resolve(false)
    } catch (e) {
      resolve(false)
    }
  })
}

const getStoredPairedFoldersList = async () => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("DeviceSyncDB_Multi", 1)
      request.onupgradeneeded = (e) => {
        const db = e.target.result
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles")
        }
      }
      request.onsuccess = (e) => {
        const db = e.target.result
        const tx = db.transaction("handles", "readonly")
        const store = tx.objectStore("handles")
        const req = store.get("pairedFoldersList")
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => resolve([])
      }
      request.onerror = () => resolve([])
    } catch (e) {
      resolve([])
    }
  })
}

export function DeviceSyncHub({ uploadFile, refreshDrive, setUploadTasks, setIsUploadToastExpanded, abortControllersRef }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const [deviceType, setDeviceType] = useState('laptop')
  const [syncStatus, setSyncStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, currentFileName: "" })
  const [syncFilter, setSyncFilter] = useState('all')

  // Multiple  // Local paired directory state
  const [pairedFolders, setPairedFolders] = useState([])
  const [supportsDirectoryPicker, setSupportsDirectoryPicker] = useState(false)
  const inFlightFileNamesRef = useRef(new Set())

  // Detect Device Type & Directory Picker support
  useEffect(() => {
    const ua = navigator.userAgent
    if (/android/i.test(ua) || /iphone|ipad|ipod/i.test(ua)) {
      setDeviceType('mobile')
    } else {
      setDeviceType('laptop')
    }

    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      setSupportsDirectoryPicker(true)
    }

    // Retrieve paired directory list from IndexedDB
    getStoredPairedFoldersList().then((list) => {
      if (Array.isArray(list)) {
        setPairedFolders(list)
      }
    })
  }, [])

  // Fetch Device Sync Status
  const fetchSyncStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/sync/status`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setSyncStatus(data)
      }
    } catch (err) {
      console.error("Error fetching sync status:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Action: Add a new local folder path
  const handleAddFolderPath = async () => {
    if (supportsDirectoryPicker) {
      try {
        const handle = await window.showDirectoryPicker({ mode: 'read' })
        if (handle) {
          const newFolder = {
            id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: handle.name,
            handle: handle
          }

          setPairedFolders(prev => {
            // Prevent duplicate entries by name
            const filtered = prev.filter(f => f.name !== handle.name)
            const updated = [...filtered, newFolder]
            savePairedFoldersList(updated)
            return updated
          })
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Directory picker error:", err)
        }
      }
    } else {
      if (folderInputRef.current) folderInputRef.current.click()
    }
  }

  // Action: Remove a paired folder path
  const handleRemoveFolderPath = (folderId) => {
    setPairedFolders(prev => {
      const updated = prev.filter(f => f.id !== folderId)
      savePairedFoldersList(updated)
      return updated
    })
  }

  // Handle folder upload from HTML input fallback
  const handleFallbackFolderSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath?.split('/')[0] || "Selected Folder"
      const newFolder = {
        id: `folder_${Date.now()}`,
        name: folderName,
        handle: null
      }
      setPairedFolders(prev => {
        const updated = [...prev.filter(f => f.name !== folderName), newFolder]
        savePairedFoldersList(updated)
        return updated
      })
      processBatchUpload(files)
    }
  }

  // Auto-Scan & Sync ALL paired local folder paths
  const handleSyncAllFolders = async () => {
    if (pairedFolders.length > 0) {
      const allFiles = []

      for (const item of pairedFolders) {
        if (item.handle) {
          try {
            if (item.handle.queryPermission) {
              const state = await item.handle.queryPermission({ mode: 'read' })
              if (state !== 'granted') {
                const reqState = await item.handle.requestPermission({ mode: 'read' })
                if (reqState !== 'granted') continue
              }
            }

            for await (const entry of item.handle.values()) {
              if (entry.kind === 'file') {
                const file = await entry.getFile()
                if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif|avif)$/i.test(file.name)) {
                  allFiles.push(file)
                }
              }
            }
          } catch (err) {
            console.error("Failed to scan directory handle:", item.name, err)
          }
        }
      }

      if (allFiles.length > 0) {
        await processBatchUpload(allFiles)
        return
      }
    }

    // Fallback: Trigger manual picker if no directory handles yielded files
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleSyncFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await processBatchUpload(files)
  }

  const processBatchUpload = async (files) => {
    if (isSyncing) return // Prevent multiple rapid clicks

    const pictureFiles = (files || []).filter(f => f.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif|avif)$/i.test(f.name))

    if (pictureFiles.length === 0) {
      alert("No picture files found to sync.")
      return
    }

    // Build complete set of already synced and in-flight file names
    const existingFileNames = new Set([
      ...(syncStatus?.syncedFileNames || []),
      ...(syncStatus?.syncedFiles || []).map(f => f.name.toLowerCase()),
      ...Array.from(inFlightFileNamesRef.current)
    ])

    const filesToUpload = pictureFiles.filter(f => !existingFileNames.has(f.name.toLowerCase()))

    if (filesToUpload.length === 0) {
      alert("All selected pictures are already synced to cloud storage.")
      return
    }

    // Mark these files as in-flight to prevent duplicate parallel triggers
    filesToUpload.forEach(f => inFlightFileNamesRef.current.add(f.name.toLowerCase()))

    setIsSyncing(true)
    setSyncProgress({ current: 0, total: filesToUpload.length, currentFileName: filesToUpload[0].name })

    // Target the specific folder for this device
    const targetFolderId = deviceType === 'mobile' ? syncStatus?.mobileFolderId : syncStatus?.laptopFolderId

    // Create task entries for the floating Upload Progress toast panel
    const newTasks = filesToUpload.map(f => {
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

    if (setUploadTasks) {
      setUploadTasks(prev => [...prev, ...newTasks])
    }
    if (setIsUploadToastExpanded) {
      setIsUploadToastExpanded(true)
    }

    let uploadedCount = 0
    let totalBytesUploaded = 0

    // CONCURRENT MULTI-FILE UPLOAD USING Promise.all
    const uploadPromises = filesToUpload.map(async (file, i) => {
      const task = newTasks[i]
      const taskId = task?.id

      if (task && task.status === 'error') return

      const controller = new AbortController()
      if (abortControllersRef && abortControllersRef.current && taskId) {
        abortControllersRef.current[taskId] = controller
      }

      try {
        const onProgress = (stats) => {
          if (setUploadTasks && taskId) {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...stats } : t))
          }
        }

        if (uploadFile) {
          const result = await uploadFile(file, controller.signal, targetFolderId || null, null, onProgress, false, {
            sourceDevice: deviceType,
            isDeviceSync: true
          })

          if (!result?.isDuplicate) {
            uploadedCount++
            totalBytesUploaded += file.size
          }
        }

        if (setUploadTasks && taskId) {
          setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t))
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          if (setUploadTasks && taskId) {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' } : t))
          }
        } else {
          console.error("Sync upload error for file", file.name, err)
          if (setUploadTasks && taskId) {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t))
          }
        }
      } finally {
        if (abortControllersRef && abortControllersRef.current && taskId) {
          delete abortControllersRef.current[taskId]
        }
        inFlightFileNamesRef.current.delete(file.name.toLowerCase())
      }
    })

    await Promise.all(uploadPromises)

    // Log sync session to server
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/files/sync/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deviceType: deviceType,
          deviceName: deviceType === 'mobile' ? 'Mobile Phone' : 'Laptop / PC',
          filesCount: uploadedCount,
          totalBytes: totalBytesUploaded
        })
      })
    } catch (logErr) {
      console.error("Failed to log sync session:", logErr)
    }

    setIsSyncing(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (folderInputRef.current) folderInputRef.current.value = ""
    fetchSyncStatus()
    if (refreshDrive) refreshDrive()
  }

  const filteredFiles = (syncStatus?.syncedFiles || []).filter(file => {
    if (syncFilter === 'mobile') return file.sourceDevice === 'mobile' || (file.isDeviceSync && file.sourceDevice !== 'laptop')
    if (syncFilter === 'laptop') return file.sourceDevice === 'laptop' || file.sourceDevice === 'desktop'
    return true
  })

  return (
    <div className="space-y-6 p-1 sm:p-4 max-w-7xl mx-auto">
      {/* Hidden File / Folder Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleSyncFileSelect}
      />
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleFallbackFolderSelect}
      />

      {/* Multiple Paired Folder Paths Card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                Paired Local Folder Paths ({pairedFolders.length})
              </h4>
              <p className="text-xs text-muted-foreground">
                Add multiple local folder paths (e.g. Downloads, WhatsApp Pictures, Screenshots). All paths will be auto-scanned when you sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFolderPath}
              className="gap-2 text-xs font-semibold border-blue-500/40 hover:border-blue-500 text-blue-600 dark:text-blue-400"
            >
              <Plus className="w-4 h-4" />
              <span>Add Local Folder Path</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={pairedFolders.length > 0 ? handleSyncAllFolders : handleAddFolderPath}
              disabled={isSyncing}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? `Syncing (${syncProgress.current}/${syncProgress.total})` : "Sync All Folder Paths"}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchSyncStatus}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Refresh Sync Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* List of Paired Folder Path Chips */}
        {pairedFolders.length === 0 ? (
          <div className="p-4 rounded-xl bg-muted/40 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">No folder paths paired yet.</p>
            <p>Click "Add Local Folder Path (+)" to pair your Downloads or Pictures folder for automatic cross-device sync.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {pairedFolders.map((folder) => (
              <div 
                key={folder.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/70 text-xs font-medium text-foreground group hover:border-blue-500/50 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate max-w-[200px]" title={folder.name}>{folder.name}</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  <Check className="w-2.5 h-2.5 mr-0.5" /> Paired
                </span>
                <button
                  onClick={() => handleRemoveFolderPath(folder.id)}
                  className="ml-1 text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                  title="Remove folder path"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Device Indicator & Device Folders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Device Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("sync.currentDevice", "Current Active Device")}
            </span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="my-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {deviceType === 'mobile' ? (
                <Smartphone className="w-8 h-8" />
              ) : (
                <Laptop className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground capitalize">
                {deviceType === 'mobile' ? t("sync.mobileDevice", "Mobile Phone") : t("sync.laptopDevice", "Laptop / Desktop")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("sync.connectedNow", "Connected & Ready to Sync")}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-500" />
            <span>
              {deviceType === 'mobile' 
                ? t("sync.mobileTip", "Pictures on mobile will sync directly into your Mobile Uploads cloud folder.")
                : t("sync.laptopTip", "Pictures on laptop will sync directly into your Laptop Uploads cloud folder.")
              }
            </span>
          </div>
        </div>

        {/* Mobile Uploads Folder Shortcut */}
        <div 
          onClick={() => navigate(syncStatus?.mobileFolderId ? `/dashboard/folder/${syncStatus.mobileFolderId}` : '/dashboard')}
          className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>{t("sync.mobileUploads", "Mobile Uploads")}</span>
            </div>
            <FolderOpen className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </div>

          <div className="my-4">
            <h4 className="text-2xl font-bold text-foreground">
              {syncStatus?.mobile?.filesCount || 0} <span className="text-sm font-normal text-muted-foreground">{t("sync.files", "pictures")}</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(syncStatus?.mobile?.totalBytes || 0)} {t("sync.stored", "stored")}
            </p>
          </div>

          <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>{t("sync.viewFolder", "View Cloud Folder")}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Laptop Uploads Folder Shortcut */}
        <div 
          onClick={() => navigate(syncStatus?.laptopFolderId ? `/dashboard/folder/${syncStatus.laptopFolderId}` : '/dashboard')}
          className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              <Laptop className="w-4 h-4" />
              <span>{t("sync.laptopUploads", "Laptop Uploads")}</span>
            </div>
            <FolderOpen className="w-5 h-5 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
          </div>

          <div className="my-4">
            <h4 className="text-2xl font-bold text-foreground">
              {syncStatus?.laptop?.filesCount || 0} <span className="text-sm font-normal text-muted-foreground">{t("sync.files", "pictures")}</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(syncStatus?.laptop?.totalBytes || 0)} {t("sync.stored", "stored")}
            </p>
          </div>

          <div className="flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>{t("sync.viewFolder", "View Cloud Folder")}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Filter & Synced Media List */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              {t("sync.recentSyncedMedia", "Recent Synced Pictures")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("sync.mediaListSubtitle", "Pictures synchronized across your mobile phone and laptop.")}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <button
              onClick={() => setSyncFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${syncFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t("sync.filterAll", "All Devices")} ({syncStatus?.total?.filesCount || 0})
            </button>
            <button
              onClick={() => setSyncFilter('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${syncFilter === 'mobile' ? 'bg-card text-blue-600 dark:text-blue-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Smartphone className="w-3 h-3" />
              {t("sync.filterMobile", "Mobile")} ({syncStatus?.mobile?.filesCount || 0})
            </button>
            <button
              onClick={() => setSyncFilter('laptop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${syncFilter === 'laptop' ? 'bg-card text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Laptop className="w-3 h-3" />
              {t("sync.filterLaptop", "Laptop")} ({syncStatus?.laptop?.filesCount || 0})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm">{t("sync.loadingSyncData", "Loading device sync statistics...")}</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileImage className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("sync.noFilesSynced", "No synced pictures found for this device filter yet.")}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t("sync.noFilesTip", "Add local folder paths above or click Sync All Folder Paths to upload received pictures.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const isMobile = file.sourceDevice === 'mobile' || (file.isDeviceSync && file.sourceDevice !== 'laptop')
              return (
                <div 
                  key={file.id}
                  className="group bg-card border border-border hover:border-blue-500/50 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileImage className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="text-sm font-semibold text-foreground truncate" title={file.name}>
                          {file.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted font-medium text-[11px]">
                      {isMobile ? (
                        <>
                          <Smartphone className="w-3 h-3 text-blue-500" />
                          <span>Mobile</span>
                        </>
                      ) : (
                        <>
                          <Laptop className="w-3 h-3 text-indigo-500" />
                          <span>Laptop</span>
                        </>
                      )}
                    </span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
