import { useEffect, useRef, useState } from "react"
import { useTheme } from "../../context/ThemeProvider"

/**
 * Cloudflare Turnstile "Not a robot" Verification Widget
 * Automatically syncs theme with application's active light/dark mode.
 */
export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  resetTrigger,
  theme,
}) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Retrieve current app theme
  let appTheme = "light"
  try {
    const themeContext = useTheme()
    appTheme = themeContext?.theme || "light"
  } catch (e) {
    appTheme = document.documentElement.classList.contains("dark") ? "dark" : "light"
  }

  // Resolve system theme if appTheme is "system"
  let resolvedTheme = theme
  if (!resolvedTheme || resolvedTheme === "auto") {
    if (appTheme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } else {
      resolvedTheme = appTheme === "dark" ? "dark" : "light"
    }
  }

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"

  // Load Turnstile Script dynamically
  useEffect(() => {
    if (window.turnstile) {
      setScriptLoaded(true)
      return
    }

    const scriptId = "cf-turnstile-script"
    const existingScript = document.getElementById(scriptId)

    if (!existingScript) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.onload = () => setScriptLoaded(true)
      script.onerror = () => {
        console.error("Failed to load Cloudflare Turnstile script.")
        if (onError) onError()
      }
      document.head.appendChild(script)
    } else {
      existingScript.addEventListener("load", () => setScriptLoaded(true))
    }
  }, [onError])

  // Render Turnstile Widget once script, container, and theme are ready
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return

    // Clean up previous widget instance if any
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch (e) {
        // ignore removal errors
      }
      widgetIdRef.current = null
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          if (onVerify) onVerify(token)
        },
        "error-callback": () => {
          if (onError) onError()
        },
        "expired-callback": () => {
          if (onExpire) onExpire()
        },
        theme: resolvedTheme,
      })
      widgetIdRef.current = id
    } catch (err) {
      console.error("Error rendering Turnstile widget:", err)
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null
      }
    }
  }, [scriptLoaded, siteKey, resolvedTheme])

  // Reset widget when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined && widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current)
        if (onExpire) onExpire()
      } catch (e) {
        // ignore
      }
    }
  }, [resetTrigger])

  return (
    <div className="flex flex-col items-center justify-center my-3 min-h-[65px] w-full">
      <div ref={containerRef} className="cf-turnstile inline-block" />
    </div>
  )
}
