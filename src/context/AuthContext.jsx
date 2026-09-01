import { createContext, useContext, useState, useEffect } from "react"
import { googleLogout } from "@react-oauth/google"
import { LoadingScreen } from "../components/LoadingScreen"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          // credentials: "include" is required to send the httpOnly cookie back to the server
          credentials: "include"
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to fetch user session", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      googleLogout()
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      })
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      setUser(null)
    }
  }

  
  const value = {
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen text="Loading website..." /> : children}
    </AuthContext.Provider>
  )
}
