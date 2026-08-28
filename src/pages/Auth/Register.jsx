import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, ArrowRight } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../context/AuthContext"

export function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Registration failed")
      }

      setSuccess(true)
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
        body: JSON.stringify({ token: credential }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Google registration failed")
      }

      login(data.user)
      navigate("/") // Google auto-verifies, redirect straight to dashboard
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background">
        <Card className="w-full max-w-md text-center border border-blue-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 rounded-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center ring-8 ring-blue-500/5 mb-5">
            <Mail className="w-8 h-8" />
          </div>
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Check Your Email</h2>
            <div className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              We've sent a verification link to:
              <span className="block mt-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 py-1.5 px-3 rounded-lg break-all">
                {formData.email}
              </span>
              <span className="block mt-3 text-xs text-muted-foreground">
                Please check your inbox and click the link to verify your account before logging in.
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            <Link to="/login" className="w-full block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 rounded-xl h-11 gap-2 transition-all">
                Go to Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
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
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
