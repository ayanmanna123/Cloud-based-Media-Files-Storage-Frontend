import { Link, useLocation } from "react-router-dom"
import { ChevronDown, Cloud } from "lucide-react"
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

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.features"), path: "/features" },
    { name: t("nav.about"), path: "/about" },
  ]

  return (
    <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative w-full px-4 md:px-12 lg:px-20 mx-auto max-w-[1600px] flex h-16 items-center justify-between">
        {/* Left Side - Brand/Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              CloudBox
            </span>
          </Link>
        </div>

        {/* Center - Links (Perfectly Centered) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8 text-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-5 transition-colors ${
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Side - Auth & Theme */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <LanguageSelector showLabel={true} />

          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-8 w-8 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.image_url} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1.5 text-sm font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium hidden sm:inline-flex">
                  {t("nav.signin")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-medium px-4 sm:px-6">
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </>
          )}
          <div className="pl-2 border-l border-border h-6 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
