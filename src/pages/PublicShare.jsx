import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { Loader2, Download, FileText, FileImage, FileVideo, FileSpreadsheet, FolderOpen, AlertCircle, Archive } from "lucide-react"
import { Button } from "../components/ui/button"
import JSZip from "jszip"
import { getFileMediaUrl } from "../utils/fileUrl"


export function PublicShare({ isBundle = false }) {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLinkData()
  }, [token])

  const fetchLinkData = async () => {
    try {
      const endpoint = isBundle ? `/api/link-shares/bundle/${token}` : `/api/link-shares/${token}`
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Link not found or expired")
      }
      const result = await res.json()
      setData(result)
      
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

  const getFileIcon = (fileName) => {
    if (!fileName) return FileText
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return FileImage
    if (fileName.match(/\.(mp4|webm|ogg)$/i)) return FileVideo
    if (fileName.match(/\.(csv|xls|xlsx)$/i)) return FileSpreadsheet
    return FileText
  }

  const [isZipping, setIsZipping] = useState(false);

  const handleDownload = (res = data?.resource) => {
    if (!res) return
    const url = getFileMediaUrl(res)
    const a = document.createElement('a')
    a.href = url
    a.download = res.name || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleBundleDownload = async (files = data?.files, zipName = "Shared_Bundle") => {
    if (!files || files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const downloadPromises = files.map(async (file) => {
        const url = getFileMediaUrl(file);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
        const blob = await response.blob();
        zip.file(file.name, blob);
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
      alert("Failed to download multiple files. Some files might be too large or inaccessible.");
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
  const isImage = isFile && resource?.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = isFile && resource?.name?.match(/\.(pdf)$/i)
  const previewUrl = isFile ? getFileMediaUrl(resource) : null
  const pdfPreviewUrl = isPdf ? previewUrl : null

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 sm:p-8">
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
        <div className="bg-card border border-border shadow-lg rounded-2xl overflow-hidden flex flex-col mb-8">
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
                  src={isPdf ? pdfPreviewUrl : previewUrl} 
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
                <p className="text-lg font-medium">No preview available</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <FolderOpen className="w-20 h-20 text-blue-400 mb-6 opacity-80" />
              <h2 className="text-2xl font-semibold mb-2">{resource?.name}</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                This folder contains {data?.files?.length || 0} files. You can download them all as a ZIP archive.
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
              <span className="text-sm text-muted-foreground">Shared securely via Cloud Storage</span>
            </div>
            
            {isBundle ? (
              <Button onClick={() => handleBundleDownload(data.files)} size="lg" disabled={isZipping} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isZipping ? "Zipping Files..." : "Download All (ZIP)"}
              </Button>
            ) : isFile ? (
              <Button onClick={() => handleDownload(resource)} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                <Download className="w-5 h-5" />
                Download File
              </Button>
            ) : (
              <Button onClick={() => handleBundleDownload(data.files, resource?.name)} size="lg" disabled={isZipping || !data?.files?.length} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Archive className="w-5 h-5" />}
                {isZipping ? "Zipping Folder..." : "Download Folder (ZIP)"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
