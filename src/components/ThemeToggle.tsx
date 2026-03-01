import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/theme/ThemeProvider";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      onClick={() => {
        try {
          // eslint-disable-next-line no-console
          console.log("ThemeToggle clicked");
        } catch {}
        toggleTheme();
      }}
      variant="ghost"
      size="icon"
      className="relative w-10 h-10 font-sans-clean"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] text-ink rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] text-ink rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
