import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  Cloud, 
  Menu, 
  X, 
  Home, 
  Sparkles, 
  Info, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  UserPlus,
  ChevronRight
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { ThemeToggle } from "../components/ThemeToggle"
import { LanguageSelector } from "../components/LanguageSelector"
import { Button } from "../components/ui/button"
import { useAuth } from "../context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

export function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: t("nav.home"), path: "/", icon: Home },
    { name: t("nav.features"), path: "/features", icon: Sparkles },
    { name: t("nav.about"), path: "/about", icon: Info },
  ]

  return (
    <nav className="border-b border-border/80 sticky top-0 z-50 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-xs">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 mx-auto max-w-[1600px] flex h-16 items-center justify-between gap-4 relative">
        {/* Left Side - Brand/Logo */}
        <div className="flex items-center shrink-0">
          <Link 
            to="/" 
            className="flex items-center space-x-2.5 group" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Cloud className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              CloudBox
            </span>
          </Link>
        </div>

        {/* Center - Desktop Links (Centered in the middle of navbar) */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Right Side - Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSelector showLabel={true} />
          
          <ThemeToggle />

          {/* Desktop Auth Links */}
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:inline-block ml-1">
                <Button variant="outline" size="sm" className="gap-2 font-medium border-border/80 hover:bg-muted/60 h-9">
                  <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t("nav.dashboard")}</span>
                </Button>
              </Link>
              <div className="hidden sm:block ml-1">
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-9 w-9 rounded-full border border-border/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all hover:ring-2 hover:ring-blue-500/20">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user.image_url} alt={user.name} />
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 p-1.5 shadow-xl border-border/80" align="end">
                    <div className="px-3 py-2 text-sm">
                      <p className="font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer py-2">
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span>{t("nav.dashboard")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="text-red-500 dark:text-red-400 cursor-pointer flex items-center gap-2 py-2 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-block ml-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-medium h-9">
                  {t("nav.signin")}
                </Button>
              </Link>
              <Link to="/signup" className="hidden sm:inline-block">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-medium px-4 h-9">
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* Nav Links */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </div>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              )
            })}
          </div>

          {/* User Account / Auth Section */}
          <div className="pt-2 border-t border-border/60">
            {user ? (
              <div className="bg-muted/40 dark:bg-muted/20 border border-border/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user.image_url} alt={user.name} />
                    <AvatarFallback className="bg-blue-600 text-white font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center gap-2 text-sm shadow-xs h-9">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t("nav.dashboard")}</span>
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                    }}
                    className="w-full justify-center gap-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 border-red-200 dark:border-red-900/30 h-9"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("nav.logout")}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center gap-2 text-sm h-10">
                    <LogIn className="w-4 h-4" />
                    <span>{t("nav.signin")}</span>
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm h-10 shadow-xs">
                    <UserPlus className="w-4 h-4" />
                    <span>{t("nav.getStarted")}</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
