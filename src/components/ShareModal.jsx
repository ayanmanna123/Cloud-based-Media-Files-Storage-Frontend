import { useState, useEffect, useRef } from "react"
import { 
  Loader2, 
  Users, 
  Trash2,
  Mail,
  UserPlus
} from "lucide-react"
import { useTranslation } from "react-i18next"
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
import { QRCodeSVG } from "qrcode.react"

const truncateName = (str, maxLength = 20) => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  const extIndex = str.lastIndexOf('.');
  if (extIndex > 0 && str.length - extIndex <= 5) {
    const ext = str.slice(extIndex);
    const nameWithoutExt = str.slice(0, extIndex);
    const avail = maxLength - ext.length - 3;
    if (avail > 3) {
      return `${nameWithoutExt.slice(0, avail)}...${ext}`;
    }
  }
  return `${str.slice(0, maxLength - 3)}...`;
};

export function ShareModal({ isOpen, onClose, resourceType, resourceId, resourceName, useDrive }) {
  const { t } = useTranslation()
  const { fetchShares, shareResource, revokeShare, searchUsers, fetchLinkShare, createLinkShare, deleteLinkShare, createBundleShare } = useDrive
  const [shares, setShares] = useState([])
  const [activeLink, setActiveLink] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(resourceType === "bundle" ? "link" : "people") // "people" | "link"
  const [showQR, setShowQR] = useState(false)
  
  // Form state
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("viewer")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [expiresAt, setExpiresAt] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  // Auto-suggestions state
  const [userSuggestions, setUserSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!email.trim() || !searchUsers) {
      setUserSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true)
      try {
        const results = await searchUsers(email.trim())
        setUserSuggestions(results || [])
        setShowSuggestions(true)
      } catch (err) {
        console.error("Error searching users:", err)
      } finally {
        setIsSearchingUsers(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [email, searchUsers])

  useEffect(() => {
    if (isOpen && resourceId) {
      loadShares()
      loadLinkShare()
      // reset form
      setEmail("")
      setUserSuggestions([])
      setShowSuggestions(false)
      setRole("viewer")
      setMessage("")
      setError("")
      setSuccess("")
      setActiveTab(resourceType === "bundle" ? "link" : "people")
      setExpiresAt("")
    }
  }, [isOpen, resourceId, resourceType])

  const loadLinkShare = async () => {
    try {
      if (resourceType === 'bundle') return; // Cannot fetch pre-existing bundle link in this UI right now
      const link = await fetchLinkShare(resourceType, resourceId)
      setActiveLink(link) // will be null if not found
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerateLink = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      let data;
      if (resourceType === 'bundle') {
        data = await createBundleShare(resourceId, expiresAt ? new Date(expiresAt).toISOString() : null)
      } else {
        data = await createLinkShare(resourceType, resourceId, expiresAt ? new Date(expiresAt).toISOString() : null)
      }
      setActiveLink(data)
    } catch (err) {
      setError(err.message || "Failed to create share link")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeLink = async () => {
    if (!activeLink) return
    try {
      await deleteLinkShare(activeLink.id)
      setActiveLink(null)
    } catch (err) {
      setError(err.message || "Failed to delete share link")
    }
  }

  const loadShares = async () => {
    if (resourceType === 'bundle') {
      setShares([]);
      setLoading(false);
      return;
    }
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
      const res = await shareResource(resourceType, resourceId, email.trim(), role, message)
      if (res && res.isUnregistered) {
        setSuccess(t("shareModal.unregisteredSuccess", { email: email.trim(), defaultValue: `Public share link emailed successfully to ${email.trim()}!` }))
      } else {
        setSuccess(t("shareModal.shareSuccess", { email: email.trim(), defaultValue: `Shared successfully with ${email.trim()}` }))
      }
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
      <DialogContent className="max-w-[92vw] sm:max-w-md p-0 overflow-hidden gap-0 rounded-2xl">
        <div className="p-5 sm:p-6 pb-4 w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold truncate pr-6">
              <UserPlus className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">{t("shareModal.shareTitle", { name: truncateName(resourceName, 15) })}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-border mt-4">
            {resourceType !== "bundle" && (
              <button
                onClick={() => setActiveTab("people")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "people" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t("shareModal.peopleTab")}
              </button>
            )}
            <button
              onClick={() => setActiveTab("link")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "link" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t("shareModal.linkTab")}
            </button>
          </div>

          {activeTab === "people" ? (
            <>
              {/* Invite Form */}
              <form onSubmit={handleShare} className="mt-4 space-y-4">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1 min-w-0" ref={containerRef}>
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  placeholder={t("shareModal.enterEmail")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => {
                    if (email.trim() && userSuggestions.length > 0) setShowSuggestions(true)
                  }}
                  className="pl-9 bg-muted/50 border-border focus-visible:ring-blue-500 text-xs sm:text-sm"
                  disabled={isSubmitting}
                  autoComplete="off"
                />

                {/* Auto-suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-lg overflow-hidden z-50 max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
                    {isSearchingUsers ? (
                      <div className="flex items-center justify-center p-3 text-xs text-muted-foreground gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {t("uploadProgress.calculating")}
                      </div>
                    ) : userSuggestions.length > 0 ? (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/50">
                          {t("shareModal.addPeople")}
                        </div>
                        {userSuggestions.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setEmail(u.email)
                              setShowSuggestions(false)
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors cursor-pointer border-b border-border/20 last:border-0"
                          >
                            <img 
                              src={u.imageUrl || u.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.email)}&background=random`} 
                              alt={u.name || u.email}
                              className="w-7 h-7 rounded-full bg-muted object-cover flex-shrink-0"
                            />
                            <div className="truncate flex-1">
                              <p className="text-xs font-medium text-foreground truncate">{u.name || "User"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-center space-y-1 bg-muted/20">
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          {t("shareModal.unregisteredUserNotice", { defaultValue: "User not registered on CloudBox." })}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t("shareModal.unregisteredUserDesc", { defaultValue: "Sending invite will email them a direct public share link." })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
                className="shrink-0 w-24 sm:w-28 h-10 px-2.5 sm:px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-xs sm:text-sm font-medium"
              >
                <option value="viewer">{t("shareModal.viewerRole")}</option>
                <option value="editor">{t("shareModal.editorRole")}</option>
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
                    {t("shareModal.sendInvite")}
                  </Button>
                </div>
              </div>
            )}
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">{success}</p>}
          </form>
          </>
          ) : (
            <div className="mt-6 space-y-4">
              {activeLink ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-md grid grid-cols-[1fr_auto] items-center gap-3 border border-border w-full">
                    <p className="text-sm truncate text-foreground font-medium select-all" title={resourceType === 'bundle' ? `${window.location.origin}/share/bundle/${activeLink.token}` : `${window.location.origin}/share/${activeLink.token}`}>
                      {resourceType === 'bundle' ? `${window.location.origin}/share/bundle/${activeLink.token}` : `${window.location.origin}/share/${activeLink.token}`}
                    </p>
                    <Button onClick={() => {
                      const url = resourceType === 'bundle' ? `${window.location.origin}/share/bundle/${activeLink.token}` : `${window.location.origin}/share/${activeLink.token}`;
                      navigator.clipboard.writeText(url);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }} variant="secondary" size="sm" className="w-full">
                      {linkCopied ? t("shareModal.linkCopied") : t("shareModal.copyLink")}
                    </Button>
                  </div>
                  {activeLink.expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(activeLink.expiresAt).toLocaleString()}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={handleRevokeLink} variant="destructive" size="sm" className="w-full">
                      {t("shareModal.deleteLink")}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4 border border-border">
                    <QRCodeSVG value={resourceType === 'bundle' ? `${window.location.origin}/share/bundle/${activeLink.token}?auto_download=true` : `${window.location.origin}/share/${activeLink.token}?auto_download=true`} size={200} />
                    <p className="text-xs text-muted-foreground mt-4 text-center">{t("shareModal.qrCodeTitle")}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">{t("shareModal.linkExpires")}</label>
                    <Input 
                      type="datetime-local" 
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={handleGenerateLink} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {t("shareModal.generateLink")}
                  </Button>
                  {error && <p className="text-sm text-red-500 font-medium text-center mt-2">{error}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* People with access */}
        {activeTab === "people" && (
          <div className="bg-muted/30 p-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t("shareModal.peopleWithAccess")}
          </h3>
          
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground bg-background rounded-lg border border-dashed border-border/60">
                {t("shareModal.peopleWithAccess")}
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
                      <p className="text-sm font-medium truncate">{share.grantee?.name || "User"}</p>
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
                      title={t("shareModal.revokeAccess")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
