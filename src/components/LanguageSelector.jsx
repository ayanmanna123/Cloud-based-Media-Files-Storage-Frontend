import { useTranslation } from "react-i18next"
import { Globe, Check } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
]

export function LanguageSelector({ variant = "ghost", showLabel = false }) {
  const { i18n } = useTranslation()
  const currentLanguageCode = i18n.language ? i18n.language.split("-")[0] : "en"
  const currentLang = LANGUAGES.find((l) => l.code === currentLanguageCode) || LANGUAGES[0]

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
          title="Change language / भाषा बदलें"
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">{currentLang.code}</span>
          {showLabel && <span className="hidden sm:inline text-xs font-normal">({currentLang.nativeName})</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
        <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
          Select Language
        </div>
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLanguageCode
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between cursor-pointer py-2 px-3 text-sm rounded-md transition-colors ${
                isSelected ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold" : ""
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{lang.nativeName}</span>
                <span className="text-[11px] text-muted-foreground">{lang.name}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
