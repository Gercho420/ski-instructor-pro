import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { I18nProvider } from "./i18n/I18nContext";
import { LANGS, type Lang } from "./i18n/translations";
import SeoHead from "./components/SeoHead";

// El panel admin no está indexado ni traducido por URL: vive fuera del
// prefijo de idioma (/admin, sin /es /en /pt) porque no es contenido público.
//
// El resto de las rutas se resuelve a mano en base a los segmentos del path,
// en vez de anidar un <Router base> de wouter: con solo dos páginas reales
// (home y 404) por idioma no vale la pena, y evita un bug de wouter donde
// "/es" (sin barra final) no matcheaba la ruta raíz del router anidado.
function AppRouter() {
  const [location] = useLocation();
  const segments = location.split("/").filter(Boolean);
  const [first, ...rest] = segments;

  if (first === "admin") {
    return <Admin />;
  }

  if (!first || !LANGS.includes(first as Lang)) {
    return <NotFound />;
  }

  if (rest.length === 0) {
    return <Home />;
  }

  return <NotFound />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <SeoHead />
            <div className="dreamy-bg min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <AppRouter />
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
