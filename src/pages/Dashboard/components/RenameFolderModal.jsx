import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

  return (
    <Dialog open={renameModalData.isOpen} onOpenChange={(open) => !open && setRenameModalData({ isOpen: false, id: null, currentName: "" })}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t("modals.renameFolderTitle")}</DialogTitle>
            <DialogDescription>
              {t("modals.renameFolderDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              autoFocus
              placeholder={t("modals.newFolderName")}
              value={renameModalData.currentName}
              onChange={(e) => setRenameModalData(prev => ({ ...prev, currentName: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameModalData({ isOpen: false, id: null, currentName: "" })} disabled={isSubmitting}>
              {t("modals.cancel")}
            </Button>
            <Button type="submit" disabled={!renameModalData.currentName.trim() || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("modals.rename")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

