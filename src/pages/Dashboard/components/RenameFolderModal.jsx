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

export function RenameFolderModal({ 
  renameModalData, 
  setRenameModalData, 
  onSubmit, 
  isSubmitting 
}) {
  return (
    <Dialog open={renameModalData.isOpen} onOpenChange={(open) => !open && setRenameModalData({ isOpen: false, id: null, currentName: "" })}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
            <DialogDescription>
              Enter a new name for the folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              autoFocus
              placeholder="Folder name" 
              value={renameModalData.currentName}
              onChange={(e) => setRenameModalData(prev => ({ ...prev, currentName: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameModalData({ isOpen: false, id: null, currentName: "" })} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!renameModalData.currentName.trim() || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
