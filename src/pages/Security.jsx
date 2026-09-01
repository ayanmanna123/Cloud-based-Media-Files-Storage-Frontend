import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Shield, Lock, KeyRound, Server, EyeOff, FileCheck2, CheckCircle2, ArrowLeft, ShieldAlert, Cpu } from "lucide-react"
import { Button } from "../components/ui/button"

export function Security() {
  const { t } = useTranslation()

  const securityPillars = [
    {
      icon: Lock,
      title: t("securityPage.p1Title", "Client-Side AES-256 Encryption"),
      desc: t("securityPage.p1Desc", "Your media and files are encrypted directly in your browser using AES-256 before being transmitted over the network. Only you hold the decryption keys.")
    },
    {
      icon: KeyRound,
      title: t("securityPage.p2Title", "Hidden Secret Vault & PIN Locking"),
      desc: t("securityPage.p2Desc", "Keep your most sensitive images and documents locked behind a personal 4-digit PIN code with brute-force delay mechanisms.")
    },
    {
      icon: Server,
      title: t("securityPage.p3Title", "TLS 1.3 In-Transit Encryption"),
      desc: t("securityPage.p3Desc", "All communications between your device and CloudBox servers are protected using modern TLS 1.3 protocols, preventing eavesdropping and tampering.")
    },
    {
      icon: EyeOff,
      title: t("securityPage.p4Title", "Zero-Knowledge Architecture"),
      desc: t("securityPage.p4Desc", "We operate on strict zero-knowledge principles for secret vault media. We cannot read your private vault files or sell your data to advertisers.")
    },
    {
      icon: FileCheck2,
      title: t("securityPage.p5Title", "Protected Share Links"),
      desc: t("securityPage.p5Desc", "Share files with peace of mind. Set custom passwords, viewer/editor permissions, and automatic expiration dates on public download links.")
    },
    {
      icon: Cpu,
      title: t("securityPage.p6Title", "Multi-Region Redundant Storage"),
      desc: t("securityPage.p6Desc", "Your encrypted data is replicated across geographically isolated data centers to ensure 99.99% data durability and protection against hardware failure.")
    }
  ]

  const standards = [
    "Bank-Grade AES-256 GCM Cipher Standards",
    "Passkey & WebAuthn Biometric Authentication",
    "Cloudflare Bot & DDoS Infrastructure Protection",
    "Automated 30-Day Trash Soft-Delete Window",
    "Encrypted Session Tokens & SameSite Cookies",
    "Zero Third-Party Advertising Data Sharing"
  ]

  return (
    <div className="bg-background relative min-h-screen pb-16 overflow-x-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-900/15 blur-3xl" />
      </div>
      <div className="absolute top-1/3 left-0 -z-10 -translate-x-1/3 pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-900/15 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="pt-12 pb-12 md:pt-20 md:pb-16 border-b border-border/60 bg-muted/20 relative">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide border border-emerald-500/20 mb-6">
            <Shield className="w-4 h-4" />
            <span>{t("securityPage.badge", "Enterprise Security Infrastructure")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {t("securityPage.heroTitle", "Bank-Grade Security & End-to-End Encryption")}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("securityPage.heroSubtitle", "Discover how CloudBox protects your photos, videos, and confidential documents using zero-knowledge architecture, client-side ciphers, and PIN-vault locking.")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 h-11 rounded-xl shadow-md">
                {t("securityPage.getStarted", "Start Storing Securely")}
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" className="h-11 rounded-xl px-6">
                {t("securityPage.viewFeatures", "Explore Features")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-6xl pt-16 space-y-16">
        {/* Core Pillars Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {t("securityPage.pillarsTitle", "Core Security Pillars")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("securityPage.pillarsSubtitle", "Every layer of the CloudBox stack is engineered from the ground up for absolute data privacy and resilience.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {securityPillars.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div 
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Security Standards Checklist Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {t("securityPage.standardsTitle", "Security & Privacy Guarantee")}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
              {t("securityPage.standardsDesc", "We strictly enforce industry leading cryptographic standards across all storage nodes and user interactions.")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {standards.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back Home CTA */}
        <div className="p-8 rounded-2xl bg-muted/30 border border-border text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            {t("securityPage.ctaTitle", "Have security questions or need assistance?")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {t("securityPage.ctaDesc", "Reach out to our dedicated security team or visit our help center to learn more.")}
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> {t("securityPage.backHome", "Back to Home")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
