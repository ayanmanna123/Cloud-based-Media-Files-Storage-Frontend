import { useState, useEffect } from "react"
import { 
  Loader2, 
  Users, 
  Trash2,
  Mail,
  UserPlus
} from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

export function ShareModal({ isOpen, onClose, resourceType, resourceId, resourceName, useDrive }) {
  const { fetchShares, shareResource, revokeShare } = useDrive
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("viewer")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isOpen && resourceId) {
      loadShares()
      // reset form
      setEmail("")
      setRole("viewer")
      setMessage("")
      setError("")
      setSuccess("")
    }
  }, [isOpen, resourceId])

  const loadShares = async () => {
    setLoading(true)
    const data = await fetchShares(resourceType, resourceId)
    setShares(data)
    setLoading(false)
  }

  const handleShare = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await shareResource(resourceType, resourceId, email, role, message)
      setSuccess(`Shared successfully with ${email}`)
      setEmail("")
      setMessage("")
      loadShares()
    } catch (err) {
      setError(err.message || "Failed to share resource")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (shareId) => {
    try {
      await revokeShare(shareId)
      setShares(prev => prev.filter(s => s.id !== shareId))
    } catch (err) {
      console.error(err)
      alert("Failed to remove access")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Share "{resourceName}"
            </DialogTitle>
            <DialogDescription>
              Add people by email to give them access to this {resourceType}.
            </DialogDescription>
          </DialogHeader>

          {/* Invite Form */}
          <form onSubmit={handleShare} className="mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Add people via email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-muted/50 border-border focus-visible:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
                className="w-28 h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            
            {email.trim() && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <Textarea 
                  placeholder="Add an optional message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none h-20 bg-muted/30"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-3">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Send invite
                  </Button>
                </div>
              </div>
            )}
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">{success}</p>}
          </form>
        </div>

        {/* People with access */}
        <div className="bg-muted/30 p-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            People with access
          </h3>
          
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground bg-background rounded-lg border border-dashed border-border/60">
                This {resourceType} hasn't been shared with anyone yet.
              </div>
            ) : (
              shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between group bg-background p-2.5 rounded-lg border border-border/50 shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img 
                      src={share.grantee?.imageUrl || `https://ui-avatars.com/api/?name=${share.grantee?.name || share.grantee?.email}&background=random`} 
                      alt="" 
                      className="w-9 h-9 rounded-full bg-muted object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{share.grantee?.name || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{share.grantee?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                    <span className="text-xs font-medium px-2 py-1 bg-muted rounded text-muted-foreground capitalize">
                      {share.role}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRevoke(share.id)}
                      className="w-8 h-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      title="Remove access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
