import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { SetSecretCodeModal } from "../pages/Dashboard/components/SetSecretCodeModal"
import { 
  Cloud, 
  FolderOpen, 
  Clock, 
  Star, 
  Users, 
  Trash2, 
  Search, 
  Plus, 
  Menu,
  X,
  FileUp,
  FolderUp,
  FolderPlus
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { startRegistration } from "@simplewebauthn/browser"
import { ThemeToggle } from "../components/ThemeToggle"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Input } from "../components/ui/input"
import { sha256 } from "../lib/utils"

export function DashboardLayout() {
  const { user, logout, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSetCodeModalOpen, setIsSetCodeModalOpen] = useState(false)
  const [isSubmittingCode, setIsSubmittingCode] = useState(false)

  useEffect(() => {
    if (!searchQuery) return

    const trimmedQuery = searchQuery.trim()

    const checkCode = async () => {
      // If secret code is set and they entered it correctly in search query
      if (user?.secretCode && trimmedQuery === user.secretCode) {
        setSearchQuery("")
        const hash = await sha256(user.secretCode)
        sessionStorage.setItem(`secret_unlocked_${hash}`, 'true')
        navigate(`/dashboard/folder/${hash}`)
      }
      // If secret code is NOT set and they type "secret" or "/secret"
      else if (!user?.secretCode && (trimmedQuery.toLowerCase() === "secret" || trimmedQuery === "/secret")) {
        setSearchQuery("")
        setIsSetCodeModalOpen(true)
      }
    }
    checkCode()
  }, [searchQuery, user?.secretCode, navigate])

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
        const hash = await sha256(newCode)
        sessionStorage.setItem(`secret_unlocked_${hash}`, 'true')
        navigate(`/dashboard/folder/${hash}`)
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

  const formatBytes = (bytes) => {
    if (bytes === 0 || bytes === undefined) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRegisterPasskey = async () => {
    try {
      // 1. Get registration options from server
      const optionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/passkeys/register-options`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const options = await optionsRes.json();

      if (!optionsRes.ok) throw new Error(options.error?.message || "Failed to get passkey options");

      // 2. Pass options to browser to register
      let asseResp;
      try {
        asseResp = await startRegistration(options);
      } catch (error) {
        console.error("Passkey error:", error);
        throw new Error(error.message || "Passkey registration cancelled or failed");
      }

      // 3. Verify response with server
      const verificationRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/passkeys/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(asseResp),
      });
      
      const verification = await verificationRes.json();
      
      if (!verificationRes.ok || !verification.verified) {
        throw new Error(verification.error?.message || verification.error || "Passkey registration failed");
      }

      alert("Passkey registered successfully! You can now use it to log in.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const navItems = [
    { name: "My Drive", path: "/dashboard", icon: FolderOpen },
    { name: "Recent", path: "/dashboard/recent", icon: Clock },
    { name: "Starred", path: "/dashboard/starred", icon: Star },
    { name: "Shared with me", path: "/dashboard/shared", icon: Users },
    { name: "Trash", path: "/dashboard/trash", icon: Trash2 },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex flex-col
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-border justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              CloudBox
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-start gap-2 h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md focus-visible:outline-none">
              <Plus className="w-5 h-5" />
              <span className="font-medium text-base">New</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuItem onClick={() => document.dispatchEvent(new CustomEvent('openCreateFolder'))} title="Create folder (Shift+N)">
                <FolderPlus className="w-4 h-4 mr-2 text-muted-foreground" /> Create folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => document.dispatchEvent(new CustomEvent('triggerFileUpload'))} title="File upload (Shift+U)">
                <FileUp className="w-4 h-4 mr-2 text-muted-foreground" /> File upload
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.dispatchEvent(new CustomEvent('triggerFolderUpload'))} title="Folder upload (Shift+F)">
                <FolderUp className="w-4 h-4 mr-2 text-muted-foreground" /> Folder upload
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-4 pb-4 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 bg-muted/50 border-border h-9 text-sm focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
            <span>Storage</span>
            <span>
              {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 100 * 1024 * 1024 * 1024)}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${user?.storageLimit ? Math.min(100, (user.storageUsed / user.storageLimit) * 100) : 0}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="relative z-50 h-16 flex items-center justify-between px-3 sm:px-6 border-b border-border bg-background gap-2">
          <div className="flex items-center flex-1 gap-2 sm:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="max-w-xl flex-1 relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input 
                type="text" 
                placeholder="Search files and folders..." 
                className="pl-10 bg-muted/50 border-border focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="block">
              <ThemeToggle />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-8 w-8 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.image_url} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-2 py-1.5 text-sm font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRegisterPasskey} className="cursor-pointer">
                  Register Passkey
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content scrollable area */}
        <main className="flex-1 overflow-auto bg-muted/10 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>

      <SetSecretCodeModal 
        isOpen={isSetCodeModalOpen}
        onOpenChange={setIsSetCodeModalOpen}
        onSubmit={handleSetSecretCode}
        isSubmitting={isSubmittingCode}
      />
    </div>
  )
}
