import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
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

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const formatBytes = (bytes) => {
    if (bytes === 0 || bytes === undefined) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        {/* Top Header */}
        <header className="relative z-50 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background">
          <div className="flex items-center flex-1 gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="max-w-xl flex-1 relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content scrollable area */}
        <main className="flex-1 overflow-auto bg-muted/10 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  )
}
