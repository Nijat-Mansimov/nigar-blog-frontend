import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";

export const LanguageSelector = () => {
  const { language, setLanguage, languageNames } = useLanguage();

  const languageCodes = {
    en: "EN",
    az: "AZ",
    ru: "RU",
    tr: "TR",
  } as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="font-sans-clean text-xs tracking-[0.2em] uppercase h-auto py-2 px-3 hover:bg-transparent hover:text-ink text-muted-foreground group"
        >
          <Globe className="h-3.5 w-3.5 mr-1.5 group-hover:text-ink transition-colors" />
          {languageCodes[language as keyof typeof languageCodes]}
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 font-sans-clean">
        {(Object.entries(languageNames) as Array<[any, string]>).map(
          ([lang, name]) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`text-xs cursor-pointer ${
                language === lang
                  ? "bg-card text-ink font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <span className="font-bold mr-2 w-8">
                {languageCodes[lang as keyof typeof languageCodes]}
              </span>
              <span>{name}</span>
              {language === lang && <span className="ml-auto text-ink">✓</span>}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
