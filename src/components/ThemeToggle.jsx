import { Moon, Sun } from "lucide-react"
import { useTheme } from "../context/ThemeProvider"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full flex items-center justify-center w-10 h-10">
      {theme === 'dark' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <span className="text-xs font-bold">SYS</span>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
