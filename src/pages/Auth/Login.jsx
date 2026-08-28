import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Fingerprint } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { startAuthentication } from "@simplewebauthn/browser"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../context/AuthContext"
import GeometricGridBackground from "../../components/GeometricGridBackground"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Login failed")
      }

      login(data.user)
      navigate("/dashboard")
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential) => {
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
        throw new Error(data.error?.message || "Google Login failed")
      }

      login(data.user)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    if (!formData.email) {
      setError("Please enter your email first to login with Passkey/Security Key")
      return
    }

    setLoading(true)
    setError("")

    try {
      const optResp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/passkey/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      const optData = await optResp.json()

      if (!optResp.ok) {
        throw new Error(optData.error?.message || "Failed to generate passkey challenge")
      }

      const authResp = await startAuthentication({ optionsJSON: optData.options })

      const verifyResp = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/passkey/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, body: authResp }),
      })

      const verifyData = await verifyResp.json()

      if (!verifyResp.ok) {
        throw new Error(verifyData.error?.message || "Passkey authentication failed")
      }

      login(verifyData.user)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
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

      <Card className="relative z-10 w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7),_inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[2rem]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
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
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handlePasskeyLogin} disabled={loading}>
              <Fingerprint className="mr-2 h-4 w-4" />
              Sign in with Passkey
            </Button>

            <div className="flex justify-center mt-2">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  handleGoogleSuccess(credentialResponse.credential);
                }}
                onError={() => {
                  setError("Google Login Failed");
                }}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
