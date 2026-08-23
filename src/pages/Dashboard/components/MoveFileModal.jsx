import { Loader2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

export function MoveFileModal({ 
  moveFileModalData, 
  setMoveFileModalData, 
  allFolders, 
  onSubmit, 
  isSubmitting 
}) {
  return (
    <Dialog open={moveFileModalData.isOpen} onOpenChange={(open) => !open && setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Move file</DialogTitle>
            <DialogDescription>
              Select a destination folder for <span className="font-semibold break-all">'{moveFileModalData.currentName}'</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select 
              value={moveFileModalData.selectedFolderId}
              onChange={(e) => setMoveFileModalData(prev => ({ ...prev, selectedFolderId: e.target.value }))}
              disabled={isSubmitting}
              className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
            >
              <option value="root">My Drive (Root)</option>
              {allFolders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Move
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
