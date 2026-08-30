import { useTranslation } from "react-i18next"
import { 
  ShieldCheck, 
  FolderTree, 
  UploadCloud, 
  Share2, 
  Link as LinkIcon, 
  Search, 
  Clock, 
  Trash2,
  EyeOff,
  History,
  FileImage,
  Activity,
  Tags,
  Users,
  PieChart,
  Lock
} from "lucide-react"

export function Features() {
  const { t } = useTranslation()

  const mvpFeatures = [
    {
      icon: ShieldCheck,
      title: t("featuresPage.secureAuthTitle"),
      description: t("featuresPage.secureAuthDesc"),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: Lock,
      title: t("featuresPage.imageEncryptionTitle"),
      description: t("featuresPage.imageEncryptionDesc"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      icon: EyeOff,
      title: t("featuresPage.hiddenMediaTitle"),
      description: t("featuresPage.hiddenMediaDesc"),
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20"
    },
    {
      icon: FolderTree,
      title: t("featuresPage.folderMgmtTitle"),
      description: t("featuresPage.folderMgmtDesc"),
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    },
    {
      icon: UploadCloud,
      title: t("featuresPage.fileOpsTitle"),
      description: t("featuresPage.fileOpsDesc"),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: Share2,
      title: t("featuresPage.granularSharingTitle"),
      description: t("featuresPage.granularSharingDesc"),
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20"
    },
    {
      icon: LinkIcon,
      title: t("featuresPage.shareLinksTitle"),
      description: t("featuresPage.shareLinksDesc"),
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20"
    },
    {
      icon: Search,
      title: t("featuresPage.smartSearchTitle"),
      description: t("featuresPage.smartSearchDesc"),
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      icon: Clock,
      title: t("featuresPage.quickAccessTitle"),
      description: t("featuresPage.quickAccessDesc"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      icon: Trash2,
      title: t("featuresPage.trashRecoveryTitle"),
      description: t("featuresPage.trashRecoveryDesc"),
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    }
  ]

  const phase2Features = [
    {
      icon: History,
      title: t("featuresPage.versionHistoryTitle"),
      description: t("featuresPage.versionHistoryDesc"),
    },
    {
      icon: FileImage,
      title: t("featuresPage.richPreviewsTitle"),
      description: t("featuresPage.richPreviewsDesc"),
    },
    {
      icon: Activity,
      title: t("featuresPage.auditLogsTitle"),
      description: t("featuresPage.auditLogsDesc"),
    },
    {
      icon: Tags,
      title: t("featuresPage.advOrgTitle"),
      description: t("featuresPage.advOrgDesc"),
    },
    {
      icon: Users,
      title: t("featuresPage.teamWorkspacesTitle"),
      description: t("featuresPage.teamWorkspacesDesc"),
    },
    {
      icon: PieChart,
      title: t("featuresPage.analyticsTitle"),
      description: t("featuresPage.analyticsDesc"),
    }
  ]

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
        <div className="w-[800px] h-[800px] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-3xl" />
      </div>
      <div className="absolute top-1/2 left-0 -z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-8 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold tracking-wide border border-blue-100 dark:border-blue-900 shadow-sm">
            <span>{t("featuresPage.capabilities")}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            {t("featuresPage.title")}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t("featuresPage.subtitle")}
          </p>
        </div>

        {/* Core MVP Features */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">{t("featuresPage.coreTitle")}</h2>
              <p className="text-muted-foreground">{t("featuresPage.coreSubtitle")}</p>
            </div>
            <div className="hidden sm:flex px-3 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground border border-border">
              {t("featuresPage.availableNow")}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mvpFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative flex flex-col p-6 bg-card hover:bg-muted/50 rounded-2xl border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} ${feature.color} border ${feature.borderColor} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-bold mb-3 group-hover:text-foreground transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 2 Features */}
        <div className="relative rounded-3xl overflow-hidden border border-border bg-muted/20 backdrop-blur-sm p-8 md:p-12 lg:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  {t("featuresPage.comingSoon")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("featuresPage.futureTitle")}</h2>
                <p className="text-lg text-muted-foreground">
                  {t("featuresPage.futureSubtitle")}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {phase2Features.map((feature, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
