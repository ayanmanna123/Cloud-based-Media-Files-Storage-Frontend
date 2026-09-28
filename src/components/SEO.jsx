import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const SITE_NAME = "CloudBox"
const DEFAULT_TITLE = "CloudBox - Secure Cloud Storage & Private Media Vault"
const DEFAULT_DESCRIPTION = "CloudBox is a high-performance, secure cloud storage platform. Store, share, and protect your media and documents with client-side AES-256 encryption, secret vault PIN locking, and instant link sharing."
const DEFAULT_KEYWORDS = "cloud storage, secure file storage, media vault, client-side encryption, AES-256 GCM, secret vault, password protected sharing, zero knowledge cloud, cloud drive, photo backup"
const BASE_URL = typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost") 
  ? window.location.origin 
  : "https://cloud-based-media-files-storage-fro.vercel.app"
const DEFAULT_IMAGE = "https://cloud-based-media-files-storage-fro.vercel.app/og-image.png"

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  nofollow = false,
  structuredData = null,
}) {
  const location = useLocation()

  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE

    document.title = formattedTitle

    // Helper to update or create meta tags
    const updateMeta = (attrName, attrValue, content) => {
      if (!content) return
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`)
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attrName, attrValue)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    // Helper to update or create link tags
    const updateLink = (rel, href) => {
      if (!href) return
      let el = document.querySelector(`link[rel="${rel}"]`)
      if (!el) {
        el = document.createElement("link")
        el.setAttribute("rel", rel)
        document.head.appendChild(el)
      }
      el.setAttribute("href", href)
    }

    // 2. Canonical URL
    const canonicalUrl = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${BASE_URL}${canonical}`
      : `${BASE_URL}${location.pathname}`
    updateLink("canonical", canonicalUrl)

    // 3. Description & Keywords
    updateMeta("name", "description", description)
    updateMeta("name", "keywords", keywords)
    updateMeta("name", "title", formattedTitle)

    // 4. Robots Directives
    const robotsContent = noindex
      ? `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`
      : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    updateMeta("name", "robots", robotsContent)

    // 5. Open Graph Meta
    updateMeta("property", "og:title", formattedTitle)
    updateMeta("property", "og:description", description)
    updateMeta("property", "og:url", canonicalUrl)
    updateMeta("property", "og:type", ogType)
    updateMeta("property", "og:image", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`)
    updateMeta("property", "og:site_name", SITE_NAME)

    // 6. Twitter Card Meta
    updateMeta("name", "twitter:title", formattedTitle)
    updateMeta("name", "twitter:description", description)
    updateMeta("name", "twitter:image", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`)
    updateMeta("name", "twitter:card", "summary_large_image")

    // 7. Structured Data (JSON-LD)
    const schemaId = "route-structured-data"
    let existingScript = document.getElementById(schemaId)

    if (structuredData) {
      if (!existingScript) {
        existingScript = document.createElement("script")
        existingScript.id = schemaId
        existingScript.type = "application/ld+json"
        document.head.appendChild(existingScript)
      }
      existingScript.textContent = JSON.stringify(structuredData)
    } else if (existingScript) {
      existingScript.remove()
    }

    return () => {
      // Clean up dynamic schema when leaving the route
      const s = document.getElementById(schemaId)
      if (s) s.remove()
    }
  }, [title, description, keywords, canonical, ogType, ogImage, noindex, nofollow, structuredData, location.pathname])

  return null
}

export default SEO
