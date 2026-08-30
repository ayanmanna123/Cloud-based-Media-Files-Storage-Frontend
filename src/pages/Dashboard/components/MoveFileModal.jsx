import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

  return (
    <Dialog open={moveFileModalData.isOpen} onOpenChange={(open) => !open && setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t("modals.moveItemTitle")}</DialogTitle>
            <DialogDescription>
              {t("modals.moveItemDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select 
              value={moveFileModalData.selectedFolderId}
              onChange={(e) => setMoveFileModalData(prev => ({ ...prev, selectedFolderId: e.target.value }))}
              disabled={isSubmitting}
              className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
            >
              <option value="root">{t("dashboard.myDrive")} (Root)</option>
              {allFolders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMoveFileModalData({ isOpen: false, id: null, currentName: "", selectedFolderId: "root" })} disabled={isSubmitting}>
              {t("modals.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("modals.moveHere")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

