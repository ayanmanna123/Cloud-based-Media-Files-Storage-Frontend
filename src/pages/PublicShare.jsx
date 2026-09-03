import { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Loader2, Download, FileText, FileImage, FileVideo, FileSpreadsheet, FolderOpen, AlertCircle, Archive, CheckCircle2, LogIn, X } from "lucide-react"
import { Button } from "../components/ui/button"
import JSZip from "jszip"
import { deriveEncryptionKey, decryptFileWithFallbackKeys } from "../lib/cryptoUtils"
import { useAuth } from "../context/AuthContext"

export function PublicShare({ isBundle = false }) {
  const { t } = useTranslation()
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publicPreviewUrl, setPublicPreviewUrl] = useState(null)
  const [showGuestModal, setShowGuestModal] = useState(false)

  useEffect(() => {
    fetchLinkData()
  }, [token])

  const fetchLinkData = async () => {
    try {
      const endpoint = isBundle ? `/api/link-shares/bundle/${token}` : `/api/link-shares/${token}`
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        credentials: "include"
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Link not found or expired")
      }
      const result = await res.json()
      setData(result)
      
      const resource = result.resource;
      const isEncrypted = resource?.is_encrypted || resource?.isEncrypted;

      if (result.resourceType === 'file' && isEncrypted) {
        try {
          const rawUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${resource.storageKey}`;
          const fileRes = await fetch(rawUrl);
          if (fileRes.ok) {
            const arrayBuffer = await fileRes.arrayBuffer();
            const encIv = resource.encryption_iv || resource.encryptionIv;
            const decryptedBuffer = await decryptFileWithFallbackKeys(arrayBuffer, user, encIv, resource);
            const blob = new Blob([decryptedBuffer], { type: resource.mime_type || resource.mimeType || 'image/jpeg' });
            setPublicPreviewUrl(URL.createObjectURL(blob));
          }
        } catch (previewErr) {
          console.error("Public preview decryption error:", previewErr);
        }
      }

      // Check guest modal state
      const guestDismissed = sessionStorage.getItem(`guest_dismissed_${token}`);
      if (!user && !guestDismissed) {
        setShowGuestModal(true);
      }

      // Auto download if requested
      if (searchParams.get("auto_download") === "true") {
        if ((isBundle || result.resourceType === 'folder') && result.files && result.files.length > 0) {
          handleBundleDownload(result.files, result.resource?.name || "Shared_Bundle")
        } else if (!isBundle && result.resourceType === 'file') {
          handleDownload(result.resource)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDismissGuestModal = () => {
    sessionStorage.setItem(`guest_dismissed_${token}`, "true")
    setShowGuestModal(false)
  }

  const handleGoToLogin = () => {
    const currentPath = location.pathname + location.search;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return FileText
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|heic|heif)$/i)) return FileImage
    if (fileName.match(/\.(mp4|webm|ogg)$/i)) return FileVideo
    if (fileName.match(/\.(csv|xls|xlsx)$/i)) return FileSpreadsheet
    return FileText
  }

  const [isZipping, setIsZipping] = useState(false);

  const handleDownload = async (res = data?.resource) => {
    if (!res) return
    const isEncrypted = res.is_encrypted || res.isEncrypted;

    if (isEncrypted) {
      try {
        const rawUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${res.storageKey}`;
        const fileRes = await fetch(rawUrl);
        if (!fileRes.ok) throw new Error("Failed to download encrypted file payload");

        const arrayBuffer = await fileRes.arrayBuffer();
        const encIv = res.encryption_iv || res.encryptionIv;
        const decryptedBuffer = await decryptFileWithFallbackKeys(arrayBuffer, user, encIv, res);

        const blob = new Blob([decryptedBuffer], { type: res.mime_type || res.mimeType || 'application/octet-stream' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = res.name || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error("Public download decryption error:", err);
        alert("Failed to decrypt shared file: " + err.message);
      }
    } else {
      const url = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${res.storageKey}?attachment=true`
      const a = document.createElement('a')
      a.href = url
      a.download = res.name || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleBundleDownload = async (files = data?.files, zipName = "Shared_Bundle") => {
    if (!files || files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const downloadPromises = files.map(async (file) => {
        const url = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
        const arrayBuffer = await response.arrayBuffer();

        const isEncrypted = file.is_encrypted || file.isEncrypted;
        let blobPayload;

        if (isEncrypted) {
          const encIv = file.encryption_iv || file.encryptionIv;
          const decryptedBuffer = await decryptFileWithFallbackKeys(arrayBuffer, user, encIv, file);
          blobPayload = new Blob([decryptedBuffer], { type: file.mime_type || file.mimeType || 'application/octet-stream' });
        } else {
          blobPayload = new Blob([arrayBuffer]);
        }

        zip.file(file.name, blobPayload);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${zipName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 100);
    } catch (err) {
      console.error("Failed to create zip:", err);
      alert("Failed to download multiple files: " + err.message);
    } finally {
      setIsZipping(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground font-medium">Loading shared content...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">{error || "This link is invalid or has expired."}</p>
        </div>
      </div>
    )
  }

  const isFile = data.resourceType === 'file'
  const resource = data.resource
  const Icon = isFile ? getFileIcon(resource?.name) : FolderOpen
  const isImage = isFile && resource?.name?.match(/\.(jpg|jpeg|png|gif|webp|avif|heic|heif)$/i)
  const isPdf = isFile && resource?.name?.match(/\.(pdf)$/i)
  const previewUrl = isFile ? `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${resource.storageKey}` : null
  const pdfPreviewUrl = isPdf ? `${previewUrl}/ik-thumbnail.jpg` : null

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 sm:p-8 relative">
      {/* Guest Prompt Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={handleDismissGuestModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-center text-foreground mb-2">
              Save this item to your Storage?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              Sign in to automatically save this {isFile ? 'file' : 'folder'} to your <span className="font-semibold text-foreground">"Shared with me"</span> section with view access.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 text-base font-semibold shadow-md shadow-blue-500/20"
              >
                <LogIn className="w-5 h-5" /> Sign In / Register
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismissGuestModal}
                className="w-full border-border text-foreground hover:bg-accent h-11"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 truncate max-w-2xl mx-auto px-4">
            {resource?.name || "Shared Item"}
          </h1>
          {isFile && resource?.sizeBytes && (
            <p className="text-muted-foreground font-medium">
              {(resource.sizeBytes / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </div>

        {/* Preview Card */}
        <div className="bg-card border border-border shadow-lg rounded-2xl overflow-hidden flex flex-col mb-6">
          {isBundle ? (
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <Archive className="w-16 h-16 text-blue-500 opacity-80" />
              </div>
              <h2 className="text-xl font-semibold mb-4 text-center">Bundle Contents</h2>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {data.files?.map(f => {
                  const FIcon = getFileIcon(f.name);
                  return (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                      <FIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="truncate flex-1">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{(f.size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : isFile ? (
            <div className="flex-1 bg-muted/10 min-h-[400px] flex items-center justify-center relative p-8">
              {(isImage || isPdf) ? (
                <img 
                  src={publicPreviewUrl || (isPdf ? pdfPreviewUrl : previewUrl)} 
                  alt={resource?.name} 
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`flex flex-col items-center justify-center text-muted-foreground w-full h-full ${(isImage || isPdf) ? 'hidden' : 'flex'}`}>
                <Icon className="w-24 h-24 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t("publicShare.noPreviewAvailable", "No preview available")}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <FolderOpen className="w-20 h-20 text-blue-400 mb-6 opacity-80" />
              <h2 className="text-2xl font-semibold mb-2">{resource?.name}</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {!data?.files || data.files.length === 0 
                  ? t("publicShare.emptyFolder", "This folder is empty.") 
                  : t("publicShare.folderContainsFiles", "This folder contains {{count}} files. You can download them all as a ZIP archive.", { count: data.files.length })}
              </p>
              
              {data?.files && data.files.length > 0 && (
                <div className="w-full max-w-md bg-muted/30 border border-border rounded-lg overflow-hidden text-left max-h-[250px] overflow-y-auto shadow-inner">
                  {data.files.map(f => {
                    const FIcon = getFileIcon(f.name);
                    return (
                      <div key={f.id} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
                        <FIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="truncate flex-1">
                          <p className="text-sm font-medium truncate">{f.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{(f.size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="bg-muted/50 p-6 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("publicShare.sharedSecurely", "Shared securely via Cloud Storage")}</span>
            </div>
            
            {isBundle ? (
              <Button onClick={() => handleBundleDownload(data.files)} size="lg" disabled={isZipping} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isZipping ? t("publicShare.zippingFiles", "Zipping Files...") : t("publicShare.downloadAllZip", "Download All (ZIP)")}
              </Button>
            ) : isFile ? (
              <Button onClick={() => handleDownload(resource)} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                <Download className="w-5 h-5" />
                {t("publicShare.downloadFile", "Download File")}
              </Button>
            ) : (
              <Button onClick={() => handleBundleDownload(data.files, resource?.name)} size="lg" disabled={isZipping || !data?.files?.length} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Archive className="w-5 h-5" />}
                {isZipping ? t("publicShare.zippingFolder", "Zipping Folder...") : t("publicShare.downloadFolderZip", "Download Folder (ZIP)")}
              </Button>
            )}
          </div>
        </div>

        {/* Saved Banner for Logged-In Users (Bottom Section) */}
        {user && (data.savedToSharedWithMe || user) && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-950 dark:text-emerald-200">
                {t("publicShare.savedToSharedWithMe", "Saved to your Shared with me section with view access.")}
              </span>
            </div>
            <Button 
              onClick={() => navigate('/dashboard/shared')} 
              size="sm" 
              variant="outline" 
              className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold rounded-full px-5"
            >
              Open in My Storage
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
