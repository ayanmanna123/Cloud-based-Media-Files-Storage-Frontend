import { useState, useEffect } from "react"
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

export function RenameFileModal({ 
  renameFileModalData, 
  setRenameFileModalData, 
  onSubmit, 
  isSubmitting 
}) {
  const { t } = useTranslation()
  const fullName = renameFileModalData.currentName || "";
  const lastDotIndex = fullName.lastIndexOf(".");
  
  // Extract extension if a valid extension exists
  const hasExt = lastDotIndex > 0 && lastDotIndex < fullName.length - 1;
  const originalExt = hasExt ? fullName.slice(lastDotIndex) : "";
  const initialBase = hasExt ? fullName.slice(0, lastDotIndex) : fullName;

  const [baseName, setBaseName] = useState(initialBase);

  // Sync internal baseName state when modal opens or currentName changes
  useEffect(() => {
    if (renameFileModalData.isOpen) {
      const name = renameFileModalData.currentName || "";
      const dotIdx = name.lastIndexOf(".");
      const isExtValid = dotIdx > 0 && dotIdx < name.length - 1;
      setBaseName(isExtValid ? name.slice(0, dotIdx) : name);
    }
  }, [renameFileModalData.isOpen, renameFileModalData.currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFullName = `${baseName.trim()}${originalExt}`;
    // Update parent state with the combined baseName + locked extension
    setRenameFileModalData(prev => ({ ...prev, currentName: finalFullName }));
    // Trigger submit handler
    onSubmit(e, finalFullName);
  };

  return (
    <Dialog open={renameFileModalData.isOpen} onOpenChange={(open) => !open && setRenameFileModalData({ isOpen: false, id: null, currentName: "" })}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("modals.renameFileTitle")}</DialogTitle>
            <DialogDescription>
              {t("modals.renameFileDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <Input 
                autoFocus
                placeholder={t("modals.newFileName")}
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 font-medium"
              />
              {hasExt && (
                <div className="flex items-center px-3 py-2 bg-muted/80 border border-border rounded-md text-xs font-bold text-muted-foreground select-none flex-shrink-0">
                  <span className="font-mono">{originalExt}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameFileModalData({ isOpen: false, id: null, currentName: "" })} disabled={isSubmitting}>
              {t("modals.cancel")}
            </Button>
            <Button type="submit" disabled={!baseName.trim() || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("modals.rename")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

