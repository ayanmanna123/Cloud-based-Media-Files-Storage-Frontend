import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Sparkles, Calendar, Tag, ArrowLeft, Rocket, ShieldCheck, Zap, Layers, Lock, Globe } from "lucide-react"
import { Button } from "../components/ui/button"

export function Changelog() {
  const { t } = useTranslation()

  const releases = [
    {
      version: "v2.0.0",
      date: "September 1, 2026",
      badge: "Major Release",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      title: "Secret Vault, Turnstile Security & Multi-Language Engine",
      description: "A major update packed with privacy features, bot protection, and global internationalization.",
      changes: [
        { type: "Feature", text: "Added Secret Vault with 4-digit PIN protection for confidential media files." },
        { type: "Security", text: "Integrated Cloudflare Turnstile CAPTCHA for signup and password reset flows." },
        { type: "i18n", text: "Added multi-language localization supporting 8 Indian and global languages." },
        { type: "Security", text: "Integrated Passkey / WebAuthn biometric login support." },
        { type: "Feature", text: "Added Public Share Bundles for sharing multiple items with a single link." }
      ]
    },
    {
      version: "v1.9.0",
      date: "August 15, 2026",
      badge: "Feature Release",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      title: "Client-Side Media Encryption & Custom Expiration Shares",
      description: "Enhanced file encryption capabilities and granular link controls.",
      changes: [
        { type: "Security", text: "Client-side AES-256 GCM encryption before media cloud upload." },
        { type: "Feature", text: "Custom password protection and automated expiration for public share links." },
        { type: "UI/UX", text: "New dark/light mode theme engine with system auto-detection." },
        { type: "Improvement", text: "Optimized grid and list view rendering for large file directories." }
      ]
    },
    {
      version: "v1.5.0",
      date: "June 20, 2026",
      badge: "Platform Update",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "Storage Pipeline Upgrade & Google One-Tap",
      description: "Multi-cloud storage pipeline expansion and seamless single sign-on.",
      changes: [
        { type: "Backend", text: "Integrated hybrid Telegram Bot and ImageKit cloud storage provider pipeline." },
        { type: "Auth", text: "Added Google OAuth 2.0 Sign-In and Google One-Tap automatic login prompt." },
        { type: "Feature", text: "Smart Trash system with 30-day auto-retention and one-click file restore." }
      ]
    },
    {
      version: "v1.0.0",
      date: "January 10, 2026",
      badge: "Initial Launch",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      title: "CloudBox Platform Launch",
      description: "The initial release of CloudBox secure media storage platform.",
      changes: [
        { type: "Launch", text: "Core file management: drag-and-drop upload, renaming, moving, and deleting." },
        { type: "Feature", text: "Folder tree structure with breadcrumb navigation." },
        { type: "UI/UX", text: "Rich media preview support for images, videos, and PDF documents." }
      ]
    }
  ]

  const getTagColor = (type) => {
    switch (type) {
      case "Feature": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      case "Security": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      case "i18n": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      case "UI/UX": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "Backend": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="bg-background relative min-h-screen pb-16 overflow-x-hidden">
      {/* Background Decorators */}
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
            <Sparkles className="w-4 h-4" />
            <span>Product Updates & Releases</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            CloudBox Changelog
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See what&apos;s new, improved, and fixed in CloudBox. We regularly ship updates to improve your media storage experience.
          </p>
        </div>
      </section>

      {/* Main Content - Timeline */}
      <main className="container mx-auto px-4 max-w-4xl pt-12 space-y-12">
        <div className="space-y-12">
          {releases.map((release, idx) => (
            <div 
              key={idx} 
              className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm hover:border-blue-500/30 transition-all relative"
            >
              {/* Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-foreground font-mono">
                    {release.version}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${release.badgeColor}`}>
                    {release.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span>{release.date}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {release.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                {release.description}
              </p>

              {/* Changes List */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                {release.changes.map((item, cIdx) => (
                  <div key={cIdx} className="flex items-start gap-3 text-sm text-foreground">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border shrink-0 mt-0.5 ${getTagColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="p-8 rounded-2xl bg-muted/30 border border-border text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            Have a feature request or feedback?
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            We are constantly improving CloudBox based on user feedback. Let us know what you would like to see next!
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
