import { ThemeToggle } from "./components/ThemeToggle"

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">Cloud Media Storage</h1>
      <p className="text-muted-foreground">Premium React Architecture Setup</p>
      
      <div className="flex items-center gap-4 border p-6 rounded-lg shadow-sm">
        <span>Toggle Theme:</span>
        <ThemeToggle />
      </div>
    </div>
  )
}

export default App
