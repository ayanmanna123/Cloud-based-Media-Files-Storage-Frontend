import { Loader2 } from "lucide-react"
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

export function RenameFileModal({ 
  renameFileModalData, 
  setRenameFileModalData, 
  onSubmit, 
  isSubmitting 
}) {
  return (
    <Dialog open={renameFileModalData.isOpen} onOpenChange={(open) => !open && setRenameFileModalData({ isOpen: false, id: null, currentName: "" })}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Enter a new name for the file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              autoFocus
              placeholder="File name" 
              value={renameFileModalData.currentName}
              onChange={(e) => setRenameFileModalData(prev => ({ ...prev, currentName: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameFileModalData({ isOpen: false, id: null, currentName: "" })} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!renameFileModalData.currentName.trim() || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
