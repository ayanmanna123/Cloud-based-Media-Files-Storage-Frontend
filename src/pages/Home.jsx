import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import GradientWaves from "../components/GradientWaves"
import GradientText from "../components/GradientText"
import TextType from "../components/TextType"
import { 
  Cloud,
  Lock, 
  Share2, 
  Smartphone,
  FolderOpen,
  Search,
  Trash2,
  EyeOff
} from "lucide-react"

export function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center pt-6 sm:pt-12 md:pt-20 pb-12 sm:pb-16 md:pb-20 border-b border-border">
        {/* Background Gradient Waves */}
        <div className="absolute inset-0 z-0">
          <GradientWaves
            horizonColor="#5227ff"
            waveColor="#ff9ffc"
            crestColor="#ffffff"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.5}
            grain
            grainIntensity={0.05}
          />
        </div>

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-background/25 z-0 pointer-events-none" />

        {/* Hero Content Centered */}
        <div className="relative z-10 w-full px-4 md:px-12 mx-auto max-w-4xl text-center flex flex-col items-center justify-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-md text-foreground px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-8 border border-border/80 shadow-lg animate-in fade-in zoom-in-95 duration-500">
            <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">New</span>
            <span>{t("home.badge")}</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.12]">
            <GradientText
              colors={["#5227FF", "#FF9FFC", "#B497CF"]}
              animationSpeed={8}
              showBorder={false}
            >
              {t("home.heroTitle")}
            </GradientText>
          </h1>
          
          {/* Subtitle */}
          <div className="text-base sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed mx-auto font-normal min-h-[4rem] sm:min-h-[3.5rem] flex items-center justify-center text-center">
            <TextType 
              text={[
                t("home.heroSubtitle", "Store, share, and manage your photos, videos, and documents with end-to-end security and lightning speed."),
                t("home.heroSubtitle2", "Keep your private media locked safely behind your personal Secret Vault PIN."),
                t("home.heroSubtitle3", "Collaborate effortlessly with password-protected share links and custom access."),
                t("home.heroSubtitle4", "Access your encrypted cloud storage anytime, anywhere from any device.")
              ]}
              typingSpeed={50}
              deletingSpeed={30}
              pauseDuration={2200}
              showCursor={true}
              cursorCharacter="|"
              cursorBlinkDuration={0.5}
            />
          </div>
          
          {/* CTA Buttons Centered */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full sm:w-auto">
            <Link to={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 text-base h-12 px-8 rounded-xl font-semibold transition-all hover:scale-105">
                {user ? t("nav.dashboard") : t("home.getStartedBtn")}
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 rounded-xl bg-background/70 backdrop-blur-md border-border/80 hover:bg-accent font-medium transition-all">
                {t("home.exploreFeatures")}
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-muted-foreground bg-background/40 backdrop-blur-md px-6 py-3 rounded-full border border-border/50">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              {t("home.secureEncryption")}
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-violet-500" />
              {t("home.secretVault")}
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-500" />
              {t("home.easySharing")}
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-500" />
              {t("home.accessAnywhere")}
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border">
        <div className="w-full px-4 md:px-12 lg:px-20 mx-auto max-w-[1600px]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("home.featuresTitle")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("home.featuresSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureSecureStorage")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.featureSecureStorageDesc")}</p>
            </div>

            {/* Feature 2 (Hidden Vault) */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureHiddenVault")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.featureHiddenVaultDesc")}</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureEasySharing")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.featureEasySharingDesc")}</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureSmartSearch")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.featureSmartSearchDesc")}</p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureTrashRestore")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.featureTrashRestoreDesc")}</p>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureAccessAnywhere")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.featureAccessAnywhereDesc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
