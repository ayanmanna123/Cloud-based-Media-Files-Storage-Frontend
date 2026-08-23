import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Loader2, Download, FileText, FileImage, FileVideo, FileSpreadsheet, FolderOpen, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"

export function PublicShare() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLinkData()
  }, [token])

  const fetchLinkData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/link-shares/${token}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Link not found or expired")
      }
      const result = await res.json()
      setData(result)
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

  const handleDownload = () => {
    if (!data?.resource) return
    const url = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${data.resource.storageKey}?attachment=true`
    const a = document.createElement('a')
    a.href = url
    a.download = data.resource.name || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
  const previewUrl = isFile ? `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${resource.storageKey}` : null
  const pdfPreviewUrl = isPdf ? `${previewUrl}/ik-thumbnail.jpg` : null

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
          {isFile ? (
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
              <h2 className="text-2xl font-semibold mb-2">Folder Preview</h2>
              <p className="text-muted-foreground max-w-md">
                This is a shared folder. To view its contents, you would need to open it in the full application.
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="bg-muted/50 p-6 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Shared securely via Cloud Storage</span>
            </div>
            
            {isFile && (
              <Button onClick={handleDownload} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full px-8">
                <Download className="w-5 h-5" />
                Download File
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
