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
    setLoading(true)
    setError("")

    try {
      // 1. Get auth options from server
      const optionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/passkeys/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email }), // Send email if typed, else undefined
      });
      const options = await optionsRes.json();

      if (!optionsRes.ok) throw new Error(options.error?.message || "Failed to get passkey options");

      // 2. Pass options to browser to authenticate
      let asseResp;
      try {
        asseResp = await startAuthentication(options);
      } catch (error) {
        console.error("Passkey error:", error);
        throw new Error(error.message || "Passkey login cancelled or failed");
      }

      // 3. Verify response with server
      const verificationRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/passkeys/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, response: asseResp }),
      });
      
      const verification = await verificationRes.json();
      
      if (!verificationRes.ok || !verification.user) {
        throw new Error(verification.error?.message || verification.error || "Passkey verification failed");
      }

      login(verification.user);
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
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
                  type={showPassword ? "text" : "password"} 
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
