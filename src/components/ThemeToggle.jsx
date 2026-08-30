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
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' ? (
        <Moon className="h-[1.1rem] w-[1.1rem]" />
      ) : theme === 'light' ? (
        <Sun className="h-[1.1rem] w-[1.1rem]" />
      ) : (
        <span className="text-[10px] font-bold tracking-tighter">AUTO</span>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
