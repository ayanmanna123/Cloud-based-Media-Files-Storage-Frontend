import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ShieldCheck, FileText, Lock, Share2, AlertTriangle, Mail, CheckCircle2, ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "../components/ui/button"

export function Terms() {
  const { t } = useTranslation()

  const sections = [
    {
      id: "account-terms",
      icon: FileText,
      title: t("termsPage.sec1Title", "1. Account Registration & User Responsibilities"),
      content: [
        t("termsPage.sec1P1"),
        t("termsPage.sec1P2"),
        t("termsPage.sec1P3"),
        t("termsPage.sec1P4")
      ]
    },
    {
      id: "acceptable-use",
      icon: ShieldCheck,
      title: t("termsPage.sec2Title", "2. Acceptable Use Policy"),
      content: [
        t("termsPage.sec2P1"),
        t("termsPage.sec2P2"),
        t("termsPage.sec2P3"),
        t("termsPage.sec2P4")
      ]
    },
    {
      id: "privacy-storage",
      icon: Lock,
      title: t("termsPage.sec3Title", "3. Media Storage, Encryption & Privacy"),
      content: [
        t("termsPage.sec3P1"),
        t("termsPage.sec3P2"),
        t("termsPage.sec3P3"),
        t("termsPage.sec3P4")
      ]
    },
    {
      id: "public-sharing",
      icon: Share2,
      title: t("termsPage.sec4Title", "4. File Sharing & Public Access Links"),
      content: [
        t("termsPage.sec4P1"),
        t("termsPage.sec4P2"),
        t("termsPage.sec4P3"),
        t("termsPage.sec4P4")
      ]
    },
    {
      id: "termination",
      icon: AlertTriangle,
      title: t("termsPage.sec5Title", "5. Account Termination & Service Availability"),
      content: [
        t("termsPage.sec5P1"),
        t("termsPage.sec5P2"),
        t("termsPage.sec5P3")
      ]
    },
    {
      id: "contact",
      icon: Mail,
      title: t("termsPage.sec6Title", "6. Modifications & Contact Information"),
      content: [
        t("termsPage.sec6P1"),
        t("termsPage.sec6P2"),
        t("termsPage.sec6P3")
      ]
    }
  ]

  return (
    <div className="bg-background relative min-h-screen pb-16 overflow-x-hidden">
      {/* Background Glow Decorators */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-900/15 blur-3xl" />
      </div>
      <div className="absolute top-1/2 left-0 -z-10 -translate-x-1/3 pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-900/15 blur-3xl" />
      </div>

      {/* Header Banner */}
      <section className="pt-12 pb-12 md:pt-20 md:pb-16 border-b border-border/60 bg-muted/20 relative">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide border border-blue-500/20 mb-6">
            <BookOpen className="w-4 h-4" />
            <span>{t("termsPage.badge", "Legal Documentation")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {t("termsPage.title", "Terms of Service & Conditions")}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("termsPage.subtitle", "Please read these Terms and Conditions carefully. By registering for or using CloudBox, you agree to be bound by these policies.")}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-background/80 px-3 py-1 rounded-md border border-border">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t("termsPage.effectiveDate", "Effective Date: September 1, 2026")}
            </span>
            <span className="bg-background/80 px-3 py-1 rounded-md border border-border">
              {t("termsPage.version", "Version 2.0")}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-4xl pt-12 space-y-10">
        {/* Quick Summary Box */}
        <div className="p-6 rounded-2xl bg-blue-500/5 dark:bg-blue-950/30 border border-blue-500/20 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {t("termsPage.summaryTitle", "Summary Key Points")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("termsPage.summaryDesc", "You own your data. We secure your files with bank-grade encryption and Secret Vault PINs. You must keep your login credentials safe and use CloudBox solely for lawful purposes. You can export or delete your files and account at any time.")}
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <div 
                key={sec.id} 
                id={sec.id}
                className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {sec.title}
                  </h2>
                </div>

                <ul className="space-y-3 pl-2 sm:pl-4">
                  {sec.content.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="p-8 rounded-2xl bg-muted/30 border border-border text-center space-y-4 mt-12">
          <h3 className="text-xl font-bold text-foreground">
            {t("termsPage.ctaTitle", "Ready to secure your digital files?")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {t("termsPage.ctaDesc", "If you have reviewed and agree to our terms, you can proceed to create your free CloudBox account.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
                {t("termsPage.createAccount", "Create Account")}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> {t("termsPage.backHome", "Back to Home")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
