import { useTranslation } from "react-i18next"
import { Shield, Target, Users, Zap, Globe, Award } from "lucide-react"

export function AboutUs() {
  const { t } = useTranslation()

  const values = [
    {
      icon: Shield,
      title: t("aboutPage.value1Title"),
      description: t("aboutPage.value1Desc")
    },
    {
      icon: Target,
      title: t("aboutPage.value2Title"),
      description: t("aboutPage.value2Desc")
    },
    {
      icon: Users,
      title: t("aboutPage.value3Title"),
      description: t("aboutPage.value3Desc")
    }
  ]

  const stats = [
    { label: t("aboutPage.statsFilesSecured"), value: "2B+" },
    { label: t("aboutPage.statsActiveUsers"), value: "10M+" },
    { label: t("aboutPage.statsCountries"), value: "150+" },
    { label: t("aboutPage.statsUptime"), value: "99.99%" }
  ]

  return (
    <div className="bg-background relative">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/4">
        <div className="w-[800px] h-[800px] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-3xl" />
      </div>
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border/50 bg-muted/10 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold tracking-wide border border-indigo-100 dark:border-indigo-900">
              <Globe className="w-4 h-4" />
              <span>{t("aboutPage.missionBadge")}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {t("aboutPage.heroTitle")}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("aboutPage.heroSubtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 divide-x divide-border">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center px-4">
                <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 mb-2">
                  {stat.value}
                </span>
                <span className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="py-20 md:py-32 bg-muted/20 border-y border-border/50 relative">
        <div className="absolute left-0 bottom-0 -z-10 -translate-x-1/2 translate-y-1/4">
          <div className="w-[600px] h-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-900/10 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-2xl relative bg-background flex items-center justify-center p-8">
                {/* Abstract graphic representing data/cloud */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <div className="grid grid-cols-3 gap-4 w-full max-w-md relative z-10">
                  {[...Array(9)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-24 rounded-xl backdrop-blur-md border border-white/10 ${i % 2 === 0 ? 'bg-blue-600/20' : 'bg-indigo-600/20'} animate-pulse-slow`}
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Decorative float */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-background border border-border rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Award className="w-10 h-10" />
                <span className="text-xs font-bold text-center">{t("aboutPage.awardTitle")}</span>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("aboutPage.storyTitle")}</h2>
                <div className="w-20 h-1.5 bg-blue-600 rounded-full" />
              </div>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>{t("aboutPage.storyP1")}</p>
                <p>{t("aboutPage.storyP2")}</p>
                <p>{t("aboutPage.storyP3")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("aboutPage.valuesTitle")}</h2>
            <p className="text-lg text-muted-foreground">{t("aboutPage.valuesSubtitle")}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
