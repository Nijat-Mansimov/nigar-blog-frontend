import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = adminService.getAccessToken();
    setIsAdmin(!!token);
  }, [location]);

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: t('nav.home') },
    { to: "/articles", label: t('nav.articles') },
    { to: "/seminars", label: t('nav.seminars') || "Seminars" },
    { to: "/about", label: t('nav.about') },
    ...(isAdmin ? [{ to: "/admin/dashboard", label: t('nav.admin') }] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-paper/95 backdrop-blur-sm border-b border-rule" : "bg-transparent"
      }`}
    >
      {/* Top decorative rule */}
      <div className="h-px bg-ink w-full" />
      <div className="h-0.5 bg-rule w-full mb-0" />

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex-shrink-0">
          <div className="flex flex-col items-start leading-none">
            <span className="font-headline text-lg sm:text-2xl font-black tracking-tight text-ink">
              Nigar Shah
            </span>
            <span className="font-sans-clean text-[8px] sm:text-[9px] tracking-[0.35em] uppercase text-muted-foreground mt-0.5">
              {t('common.tagline')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`font-sans-clean text-xs tracking-[0.2em] uppercase transition-colors whitespace-nowrap ${
                location.pathname === to || location.pathname.startsWith(to)
                  ? "text-ink border-b border-ink pb-0.5"
                  : "text-muted-foreground hover:text-ink ink-link"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="w-px h-5 bg-rule mx-2" />
          <LanguageSelector />
          <div className="w-px h-5 bg-rule mx-2" />
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-ink" />
            ) : (
              <Menu size={20} className="text-ink" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rule bg-paper/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block font-sans-clean text-sm tracking-[0.2em] uppercase py-2 px-3 rounded transition-colors ${
                  location.pathname === to || location.pathname.startsWith(to)
                    ? "text-ink bg-muted/50 border-l-2 border-ink"
                    : "text-muted-foreground hover:text-ink hover:bg-muted/30"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-rule w-full" />
    </header>
  );
};

export default Navbar;
