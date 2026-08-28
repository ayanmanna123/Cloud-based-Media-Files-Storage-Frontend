import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import GeometricGridBackground from "../../components/GeometricGridBackground"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${import.meta.env.VITE_EMAIL_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to request password reset")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

        <Card className="relative z-10 w-full max-w-md text-center bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7),_inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[2rem] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center ring-8 ring-blue-500/5 mb-5">
            <Mail className="w-8 h-8" />
          </div>
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Check Your Email</h2>
            <div className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              If an account exists for:
              <span className="block mt-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 py-1.5 px-3 rounded-lg break-all">
                {email}
              </span>
              <span className="block mt-3 text-xs text-muted-foreground">
                We have sent a password reset link to your email address.
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            <Link to="/login" className="w-full block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 rounded-xl h-11 gap-2 transition-all">
                Return to Login <ArrowRight className="w-4 h-4" />
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

      <Card className="relative z-10 w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7),_inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[2rem]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
