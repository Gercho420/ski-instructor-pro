import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { LANGS, LANG_FLAGS, type Lang } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Globe, ChevronDown, MessageCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { data: contactConfig } = trpc.config.getByCategory.useQuery({ category: "contact" });

  const waNumber = useMemo(() => {
    if (!contactConfig) return "34600000000";
    const map: Record<string, string> = {};
    contactConfig.forEach(c => { map[c.configKey] = c.configValue; });
    const number = map.whatsapp || "+34 600 000 000";
    return number.replace(/[^0-9]/g, "");
  }, [contactConfig]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    // Preserva el resto del path (ej. /es/404 -> /en/404), no solo la raíz.
    const segments = location.split("/").filter(Boolean);
    const rest = LANGS.includes(segments[0] as Lang) ? segments.slice(1) : segments;
    setLocation(`/${newLang}/${rest.join("/")}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navItems = [
    { key: "nav.home", href: `/${lang}/` },
    { key: "nav.services", href: `/${lang}/#services` },
    { key: "nav.gallery", href: `/${lang}/#gallery` },
    { key: "nav.reviews", href: `/${lang}/#reviews` },
    { key: "nav.contact", href: `/${lang}/#contact` },
  ];

  const isAdminPage = location === "/admin";

  if (isAdminPage) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.98_0.015_300/0.85)] backdrop-blur-md border-b border-[oklch(0.90_0.02_300/0.5)]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
        {/* Logo */}
        <a href={`/${lang}/`} className="flex items-center gap-2 group">
          <span className="font-serif text-2xl tracking-wide text-[oklch(0.35_0.05_295)] transition-opacity group-hover:opacity-70">
            Ski<span className="italic">Pro</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm font-sans font-light tracking-wider uppercase text-[oklch(0.40_0.04_295)] hover:text-[oklch(0.55_0.08_295)] transition-colors duration-200"
            >
              {t(item.key)}
            </a>
          ))}
        </div>

        {/* Right side: lang selector + CTA */}
        <div className="flex items-center gap-3 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm font-sans font-light tracking-wider text-[oklch(0.40_0.04_295)] hover:text-[oklch(0.55_0.08_295)] transition-colors duration-200">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{LANG_FLAGS[lang]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {LANGS.map((l: Lang) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={`cursor-pointer ${lang === l ? "font-medium" : ""}`}
                >
                  {LANG_FLAGS[l]} — {l === "es" ? "Español" : l === "en" ? "English" : "Português"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            asChild
            variant="default"
            className="hidden md:inline-flex rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] font-sans text-sm tracking-wider px-6 py-2 transition-all duration-200 active:scale-95"
          >
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-1.5" />
              {t("nav.bookNow")}
            </a>
          </Button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[oklch(0.40_0.04_295)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[oklch(0.98_0.015_300/0.95)] backdrop-blur-md border-t border-[oklch(0.90_0.02_300/0.5)]">
          <div className="container mx-auto flex flex-col py-4 px-4 gap-4">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm font-sans font-light tracking-wider uppercase text-[oklch(0.40_0.04_295)] hover:text-[oklch(0.55_0.08_295)] transition-colors py-2"
              >
                {t(item.key)}
              </a>
            ))}
            <Button
              asChild
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] font-sans text-sm tracking-wider w-full"
            >
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("nav.bookNow")}
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
