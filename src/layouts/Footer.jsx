import { Link } from "react-router-dom"
import { Cloud } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="w-full px-4 md:px-12 lg:px-20 mx-auto max-w-[1600px] pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 md:gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-2 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                CloudBox
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
             
          </div>

          {/* Links: Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.product")}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.features")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.pricing")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.security")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.changelog")}</Link>
              </li>
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.about")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.careers")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.blog")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.contact")}</Link>
              </li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.terms")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.cookiePolicy")}</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.acceptableUse")}</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} CloudBox, Inc. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{t("footer.status")}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  )
}
