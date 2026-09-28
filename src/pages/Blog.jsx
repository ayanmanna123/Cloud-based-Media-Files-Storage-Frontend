import { useTranslation } from "react-i18next"
import { ArrowRight, CalendarDays, Clock3, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"
import SEO from "../components/SEO"

export function Blog() {
  const { t } = useTranslation()

  const articles = [
    {
      category: t("blogPage.article1Category"),
      title: t("blogPage.article1Title"),
      excerpt: t("blogPage.article1Excerpt"),
      date: t("blogPage.article1Date"),
      readTime: t("blogPage.article1ReadTime"),
      icon: LockKeyhole,
      accent: "from-blue-600 to-indigo-600",
    },
    {
      category: t("blogPage.article2Category"),
      title: t("blogPage.article2Title"),
      excerpt: t("blogPage.article2Excerpt"),
      date: t("blogPage.article2Date"),
      readTime: t("blogPage.article2ReadTime"),
      icon: ShieldCheck,
      accent: "from-violet-600 to-purple-600",
    },
    {
      category: t("blogPage.article3Category"),
      title: t("blogPage.article3Title"),
      excerpt: t("blogPage.article3Excerpt"),
      date: t("blogPage.article3Date"),
      readTime: t("blogPage.article3ReadTime"),
      icon: Sparkles,
      accent: "from-cyan-600 to-blue-600",
    },
  ]

  const featured = articles[0]
  const FeaturedIcon = featured.icon

  return (
    <div className="bg-background overflow-hidden">
      <SEO
        title={t("blogPage.seoTitle")}
        description={t("blogPage.seoDescription")}
        canonical="/blog"
        keywords="CloudBox blog, cloud storage insights, data privacy, encrypted storage, file security"
      />

      <section className="relative border-b border-border/60 bg-muted/20 py-20 sm:py-28 md:py-32">
        <div className="absolute -right-44 -top-40 h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="container relative z-10 mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
            {t("blogPage.badge")}
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-6xl md:text-7xl">
            {t("blogPage.heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t("blogPage.heroSubtitle")}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{t("blogPage.featuredBadge")}</p>
          <article className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
            <div className={`min-h-64 bg-gradient-to-br ${featured.accent} p-8 text-white sm:p-10`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"><FeaturedIcon className="h-7 w-7" /></div>
              <p className="mt-16 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">{featured.category}</p>
              <h2 className="mt-3 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">{featured.title}</h2>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{featured.date}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{featured.readTime}</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{featured.excerpt}</p>
              <button type="button" className="mt-8 inline-flex w-fit items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {t("blogPage.readArticle")} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20 py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{t("blogPage.latestBadge")}</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("blogPage.latestTitle")}</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t("blogPage.latestSubtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map(({ category, title, excerpt, date, readTime, icon: Icon, accent }) => (
              <article key={title} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${accent}`}><Icon className="h-12 w-12 text-white" /></div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">{category}</p>
                  <h3 className="mt-3 text-xl font-bold leading-snug">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
                  <div className="mt-6 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{date}</span><span>{readTime}</span>
                  </div>
                  <button type="button" className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    {t("blogPage.readArticle")} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><Sparkles className="h-7 w-7" /></div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("blogPage.ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("blogPage.ctaSubtitle")}</p>
          <a href="mailto:hello@cloudbox.com?subject=CloudBox%20Blog%20Suggestion" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            {t("blogPage.ctaButton")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  )
}
