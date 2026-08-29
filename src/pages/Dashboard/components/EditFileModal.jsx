import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Loader2, ShieldCheck } from "lucide-react"
import { useAuth } from "../../../context/AuthContext"
import { deriveEncryptionKey, decryptFileBuffer, decryptFileWithFallbackKeys } from "../../../lib/cryptoUtils"

export function EditFileModal({ 
  isOpen, 
  onClose, 
  file, 
  onSave
}) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && file) {
      setLoading(true)
      setError(null)

      const isEncrypted = file.isEncrypted || file.is_encrypted;

      if (isEncrypted) {
        fetch(`${import.meta.env.VITE_API_URL}/api/files/${file.id}`, { credentials: 'include' })
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch file details")
            return res.json()
          })
          .then(async (data) => {
            const fileRes = await fetch(data.signedUrl)
            if (!fileRes.ok) throw new Error("Failed to download encrypted file content")
            const arrayBuffer = await fileRes.arrayBuffer()

            const encIv = file.encryptionIv || file.encryption_iv || data.file?.encryptionIv || data.file?.encryption_iv
            const decryptedBuffer = await decryptFileWithFallbackKeys(arrayBuffer, user, encIv, data.file || file)

            const text = new TextDecoder().decode(decryptedBuffer)
            setContent(text)
            setLoading(false)
          })
          .catch(err => {
            console.error(err)
            setError(err.message)
            setLoading(false)
          })
      } else {
        const fileUrl = `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}`
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
    }
  }, [isOpen, file, user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const isEncrypted = file.isEncrypted || file.is_encrypted;
      // Create a File object to match what the uploadFile function expects
      const updatedFile = new File([content], file.name, { type: file.mimeType || 'text/plain' })
      
      // We pass the explicit folderId (or null if root), file.id, and isEncrypted flag
      await onSave(updatedFile, file.folderId || null, file.id, isEncrypted)
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
