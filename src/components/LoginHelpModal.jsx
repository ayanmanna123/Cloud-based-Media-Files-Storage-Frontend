import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { 
  KeyRound, 
  Fingerprint, 
  Globe, 
  MailCheck, 
  LifeBuoy, 
  ArrowRight,
  ShieldAlert
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog"
import { Button } from "./ui/button"

export function LoginHelpModal({ isOpen, onOpenChange }) {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {t("auth.loginHelpTitle", "Login & Account Help")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {t("auth.loginHelpSubtitle", "Troubleshooting and quick assistance for accessing your account.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* Item 1: Forgot Password */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-2 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <KeyRound className="w-4 h-4 text-blue-500" />
                <span>{t("auth.helpForgotPasswordTitle", "Forgot Password?")}</span>
              </div>
              <Link 
                to="/forgot-password" 
                onClick={() => onOpenChange(false)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                {t("auth.resetPasswordBtn", "Reset Now")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("auth.helpForgotPasswordDesc", "If you forgot your password, click the link above to receive a password reset link in your email.")}
            </p>
          </div>

          {/* Item 2: Passkey / Biometrics */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Fingerprint className="w-4 h-4 text-purple-500" />
              <span>{t("auth.helpPasskeyTitle", "Passkey / Biometrics Login")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("auth.helpPasskeyDesc", "Make sure you type your registered email address into the Email field before clicking 'Login with Passkey'. Also ensure biometrics or security keys are configured on your browser/device.")}
            </p>
          </div>

          {/* Item 3: Google Sign-In */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>{t("auth.helpGoogleTitle", "Google Sign-In Issues")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("auth.helpGoogleDesc", "If the Google popup closes immediately or throws an error, verify popups and third-party cookies are enabled in your browser settings.")}
            </p>
          </div>

          {/* Item 4: Email Verification */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <MailCheck className="w-4 h-4 text-emerald-500" />
              <span>{t("auth.helpEmailVerifyTitle", "Email Verification")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("auth.helpEmailVerifyDesc", "If you recently registered, check your inbox and spam/junk folders for your activation email before signing in.")}
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 pt-3 sm:justify-between items-center gap-2">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            {t("auth.helpSupportDesc", "Still having trouble? Contact support.")}
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t("modals.cancel", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
