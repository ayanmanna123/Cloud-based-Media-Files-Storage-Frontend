import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Loader2 } from "lucide-react"

import { getFileMediaUrl } from "../../../utils/fileUrl"

export function EditFileModal({ 
  isOpen, 
  onClose, 
  file, 
  onSave
}) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && file) {
      setLoading(true)
      setError(null)
      const fileUrl = getFileMediaUrl(file)

      
      fetch(fileUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch file content")
          return res.text()
        })
        .then(text => {
          setContent(text)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setError(err.message)
          setLoading(false)
        })
    }
  }, [isOpen, file])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Create a File object to match what the uploadFile function expects
      const updatedFile = new File([content], file.name, { type: file.mimeType || 'text/plain' })
      
      // We pass the explicit folderId (or null if root) and file.id so the new version is uploaded correctly
      await onSave(updatedFile, file.folderId || null, file.id)
      onClose()
    } catch (err) {
      setError(err.message || "Failed to save file")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit {file?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden py-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <textarea
              className="w-full h-full p-4 font-mono text-sm bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none whitespace-pre-wrap"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
              spellCheck={false}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || saving || !!error}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
