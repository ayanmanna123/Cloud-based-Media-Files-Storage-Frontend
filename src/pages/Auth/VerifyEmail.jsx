import { useEffect, useState, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [message, setMessage] = useState("Please wait while we verify your email...")
  
  // Prevent double-fetching in React Strict Mode
  const hasAttempted = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the URL.")
      return
    }

    if (hasAttempted.current) return
    hasAttempted.current = true

    const verify = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify/${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || "Verification failed")
        }

        setStatus("success")
        setMessage(data.message || "Your email has been successfully verified!")
      } catch (err) {
        setStatus("error")
        setMessage(err.message)
      }
    }

    verify()
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {status === "verifying" && "Verifying Email"}
            {status === "success" && <span className="text-green-500">Verification Successful</span>}
            {status === "error" && <span className="text-red-500">Verification Failed</span>}
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          {status === "success" && (
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          )}
          {status === "error" && (
            <Link to="/signup">
              <Button variant="outline">Back to Sign Up</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
