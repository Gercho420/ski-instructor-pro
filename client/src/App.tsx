import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { I18nProvider } from "./i18n/I18nContext";
import { LANGS, type Lang } from "./i18n/translations";
import SeoHead from "./components/SeoHead";

function LocalizedRoutes() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// El panel admin no está indexado ni traducido por URL: vive fuera del
// prefijo de idioma (/admin, sin /es /en /pt) porque no es contenido público.
function AppRouter() {
  const [location] = useLocation();
  const firstSegment = location.split("/").filter(Boolean)[0];

  if (firstSegment === "admin") {
    return <Admin />;
  }

  if (!firstSegment || !LANGS.includes(firstSegment as Lang)) {
    return <NotFound />;
  }

  return (
    <Router base={`/${firstSegment}`}>
      <LocalizedRoutes />
    </Router>
  );
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
