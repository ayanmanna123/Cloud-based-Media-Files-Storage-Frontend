import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import GeometricGridBackground from "../../components/GeometricGridBackground"

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [message, setMessage] = useState("Please wait while we verify your email address...")
  
  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the URL.")
      return
    }

    const verify = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_EMAIL_API_URL}/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || "Verification failed")
        }

        setStatus("success")
        setMessage(data.message || "Email verified successfully! You can now log in.")
      } catch (err) {
        setStatus("error")
        setMessage(err.message)
      }
    }

    verify()
  }, [token])

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

      <Card className={`relative z-10 w-full max-w-md text-center bg-white/16 dark:bg-black/30 backdrop-blur-[7px] border-0 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-[2rem] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300 ${
        status === "error" 
          ? "shadow-red-500/10" 
          : "shadow-blue-500/10"
      }`}>
        {status === "verifying" && (
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center ring-8 ring-blue-500/5 mb-5">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {status === "success" && (
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5 mb-5 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        )}
        {status === "error" && (
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center ring-8 ring-red-500/5 mb-5 animate-in zoom-in duration-300">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        )}

        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {status === "verifying" && <span className="text-foreground">Verifying Email...</span>}
            {status === "success" && <span className="text-foreground">Verification Successful</span>}
            {status === "error" && <span className="text-red-500">Verification Failed</span>}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        <div className="w-full">
          {status === "success" && (
            <Link to="/login" className="w-full block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 rounded-xl h-11 gap-2 transition-all">
                Go to Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {status === "error" && (
            <Link to="/signup" className="w-full block">
              <Button variant="outline" className="w-full rounded-xl h-11 border-border font-medium hover:bg-accent">
                Back to Sign Up
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  )
}
