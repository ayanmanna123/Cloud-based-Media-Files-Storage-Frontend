import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Mail, ArrowRight, HelpCircle } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { useTranslation } from "react-i18next"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../context/AuthContext"
import GeometricGridBackground from "../../components/GeometricGridBackground"
import { LoginHelpModal } from "../../components/LoginHelpModal"
import { TurnstileWidget } from "../../components/Auth/TurnstileWidget"

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"
  const { login } = useAuth()

  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedName = (formData.name || "").trim()
    if (!trimmedName || trimmedName.length < 2) {
      setError(t("auth.invalidNameMinLength", "Full name must be at least 2 characters long."))
      return
    }

    if (/\d/.test(trimmedName)) {
      setError(t("auth.invalidNameNumbers", "Full name cannot contain numbers (e.g., 123). Please enter a valid name."))
      return
    }

    if (!/[\p{L}]/u.test(trimmedName)) {
      setError(t("auth.invalidNameFormat", "Please enter a valid full name using letters."))
      return
    }

    if (!agreeTerms) {
      setError(t("auth.mustAgreeTerms", "You must agree to the Terms of Service to create an account."))
      return
    }
    setLoading(true)
    setError("")

    try {
      const baseUrl = import.meta.env.VITE_EMAIL_API_URL || import.meta.env.VITE_API_URL
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, turnstileToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to register")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
      setTurnstileResetKey((prev) => prev + 1)
      setTurnstileToken("")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential) => {
    if (!agreeTerms) {
      setError(t("auth.mustAgreeTerms", "You must agree to the Terms of Service to create an account."))
      return
    }
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credential }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Google registration failed")
      }

      login(data.user)
      navigate(redirectUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  if (success) {
    return (
      <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GeometricGridBackground
            gridSpacing={40}
            proximityRadius={183}
            maxShapeSize={27}
            dotSize={3.5}
          />
        </div>
        <div className="absolute inset-0 bg-background/30 z-0 pointer-events-none" />
        <Card className="relative z-10 w-full max-w-md text-center bg-white/16 dark:bg-black/30 backdrop-blur-[7px] border-0 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-[2rem] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center ring-8 ring-blue-500/5 mb-5">
            <Mail className="w-8 h-8" />
          </div>
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("auth.verifyEmailTitle")}</h2>
            <div className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              {t("auth.verifyEmailSubtitle")}
              <span className="block mt-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 py-1.5 px-3 rounded-lg break-all">
                {formData.email}
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            <Link to={redirectUrl !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"} className="w-full block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 rounded-xl h-11 gap-2 transition-all">
                {t("auth.signIn")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GeometricGridBackground
          gridSpacing={40}
          proximityRadius={183}
          maxShapeSize={27}
          dotSize={3.5}
        />
      </div>
      <div className="absolute inset-0 bg-background/30 z-0 pointer-events-none" />
      <Card className="relative z-10 w-full max-w-md bg-white/16 dark:bg-black/30 backdrop-blur-[7px] border-0 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-[2rem]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>
            {t("auth.registerSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.fullName")}</Label>
              <Input id="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  autoComplete="new-password"
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <TurnstileWidget 
              onVerify={setTurnstileToken}
              onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")}
              resetTrigger={turnstileResetKey}
            />

            <div className="flex items-start space-x-2.5 pt-1 pb-1">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                required
              />
              <Label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-normal cursor-pointer">
                {t("auth.iAgreeTo", "I agree to the")}{" "}
                <Link to="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  {t("footer.terms", "Terms of Service")}
                </Link>{" "}
                {t("auth.and", "and")}{" "}
                <Link to="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  {t("footer.privacy", "Privacy Policy")}
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? t("auth.signingIn") : t("auth.signUp")}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("auth.orContinueWith")}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  handleGoogleSuccess(credentialResponse.credential);
                }}
                onError={() => {
                  setError("Google Registration Failed");
                }}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-center text-sm text-muted-foreground">
          <div>
            {t("auth.alreadyHaveAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.signIn")}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t("auth.loginHelp", "Login Help")}</span>
          </button>
        </CardFooter>
      </Card>

      <LoginHelpModal isOpen={showHelpModal} onOpenChange={setShowHelpModal} />
    </div>
  )
}

