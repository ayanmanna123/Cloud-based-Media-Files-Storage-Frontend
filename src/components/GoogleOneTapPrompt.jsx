import { useGoogleOneTapLogin } from "@react-oauth/google"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export function GoogleOneTapPrompt() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse.credential) return

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: credentialResponse.credential }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || "Google One Tap login failed")
        }

        login(data.user)
        navigate("/dashboard")
      } catch (err) {
        console.error("Google One Tap error:", err)
      }
    },
    onError: () => {
      console.log("Google One Tap prompt failed or dismissed")
    },
    disabled: loading || !!user,
  })

  return null
}
