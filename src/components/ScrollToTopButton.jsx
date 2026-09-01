import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollToTopButton({ containerRef }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const target = containerRef?.current || window

    const toggleVisibility = () => {
      const scrollTop = containerRef?.current ? containerRef.current.scrollTop : (window.scrollY || document.documentElement.scrollTop)
      if (scrollTop > 200) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Run once on load/ref change
    toggleVisibility()

    target.addEventListener("scroll", toggleVisibility)
    return () => target.removeEventListener("scroll", toggleVisibility)
  }, [containerRef])

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    }
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group cursor-pointer animate-in fade-in zoom-in-75"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
    </button>
  )
}
