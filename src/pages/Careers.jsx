import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowRight, CheckCircle2, HeartHandshake, Laptop, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import SEO from "../components/SEO"

export function Careers() {
  const { t } = useTranslation()

  const perks = [
    { icon: Laptop, title: t("careersPage.perk1Title"), description: t("careersPage.perk1Desc") },
    { icon: HeartHandshake, title: t("careersPage.perk2Title"), description: t("careersPage.perk2Desc") },
    { icon: ShieldCheck, title: t("careersPage.perk3Title"), description: t("careersPage.perk3Desc") },
    { icon: Users, title: t("careersPage.perk4Title"), description: t("careersPage.perk4Desc") },
  ]

  const openings = [
    {
      title: t("careersPage.role1Title"),
      team: t("careersPage.role1Team"),
      location: t("careersPage.role1Location"),
      type: t("careersPage.role1Type"),
      description: t("careersPage.role1Desc"),
    },
    {
      title: t("careersPage.role2Title"),
      team: t("careersPage.role2Team"),
      location: t("careersPage.role2Location"),
      type: t("careersPage.role2Type"),
      description: t("careersPage.role2Desc"),
    },
    {
      title: t("careersPage.role3Title"),
      team: t("careersPage.role3Team"),
      location: t("careersPage.role3Location"),
      type: t("careersPage.role3Type"),
      description: t("careersPage.role3Desc"),
    },
  ]

  return (
    <div className="bg-background overflow-hidden">
      <SEO
        title={t("careersPage.seoTitle")}
        description={t("careersPage.seoDescription")}
        canonical="/careers"
        keywords="CloudBox careers, cloud storage jobs, privacy engineering jobs, remote software jobs"
      />

      <section className="relative border-b border-border/60 bg-muted/20 py-20 sm:py-28 md:py-36">
        <div className="absolute -top-32 right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              {t("careersPage.badge")}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl md:text-7xl">
              {t("careersPage.heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("careersPage.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#openings">
                <Button size="lg" className="h-11 w-full gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 sm:w-auto">
                  {t("careersPage.viewOpenings")} <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="mailto:careers@cloudbox.com?subject=General%20interest%20in%20CloudBox%20careers">
                <Button size="lg" variant="outline" className="h-11 w-full px-6 sm:w-auto">
                  {t("careersPage.openApplication")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{t("careersPage.whyBadge")}</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("careersPage.whyTitle")}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("careersPage.whySubtitle")}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="openings" className="border-y border-border/60 bg-muted/20 py-20 sm:py-28">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{t("careersPage.openingsBadge")}</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("careersPage.openingsTitle")}</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t("careersPage.openingsSubtitle")}</p>
          </div>
          <div className="space-y-4">
            {openings.map((opening) => (
              <article key={opening.title} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-600 dark:text-blue-400">{opening.team}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1"><MapPin className="h-3 w-3" />{opening.location}</span>
                      <span className="rounded-full border border-border px-3 py-1">{opening.type}</span>
                    </div>
                    <h3 className="text-xl font-bold sm:text-2xl">{opening.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{opening.description}</p>
                  </div>
                  <a href={`mailto:careers@cloudbox.com?subject=Application%20for%20${encodeURIComponent(opening.title)}`} className="shrink-0">
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">{t("careersPage.applyNow")} <ArrowRight className="h-4 w-4" /></Button>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><CheckCircle2 className="h-7 w-7" /></div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("careersPage.ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("careersPage.ctaSubtitle")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="mailto:careers@cloudbox.com?subject=General%20interest%20in%20CloudBox%20careers"><Button size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">{t("careersPage.sendResume")}</Button></a>
            <Link to="/about"><Button size="lg" variant="outline" className="w-full sm:w-auto">{t("careersPage.learnAboutUs")}</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
