import { useState, useEffect } from "react"
import { Loader2, Key } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

export function SetSecretCodeModal({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isSubmitting,
  initialCode = ""
}) {
  const [code, setCode] = useState("")

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode)
    }
  }, [isOpen, initialCode])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.trim()) {
      onSubmit(code.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mb-3">
              <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              {initialCode ? "Change Secret Code" : "Set up Secret Folder"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Choose a secret passcode to secure your hidden files. Typing this passcode in the search bar will unlock the secret folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input 
              type="text"
              autoFocus
              placeholder="e.g. mysecretcode123" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              className="text-center text-lg h-12 tracking-wide font-medium"
            />
          </div>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!code.trim() || isSubmitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {initialCode ? "Save Changes" : "Set Secret Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
