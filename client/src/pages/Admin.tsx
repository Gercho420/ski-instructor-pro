import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/StarRating";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Upload, Trash2, Mail, ArrowLeft, Loader2, Image as ImageIcon, Settings, Lock } from "lucide-react";
import { SERVICE_DEFS } from "@shared/const";

export default function Admin() {
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState("gallery");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await loginMutation.mutateAsync({ email, password });

      toast.success("Sesión iniciada correctamente");
      utils.invalidate();
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Email o contraseña incorrectos");
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.55_0.08_295)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-[oklch(0.98_0.01_300)]">
        <div className="w-full max-w-sm p-8 bg-white/85 backdrop-blur-md rounded-2xl border border-[oklch(0.90_0.02_300/0.5)] shadow-xl">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-[oklch(0.55_0.08_295/0.1)] flex items-center justify-center text-[oklch(0.55_0.08_295)]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl text-[oklch(0.30_0.05_295)] font-semibold">
              Panel de Control
            </h1>
            <p className="text-xs text-[oklch(0.50_0.03_295)] font-light">
              Ingresa tus credenciales de administrador
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-sans tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-1 block">
                Correo Electrónico
              </label>
              <Input
                type="email"
                required
                placeholder="admin@skipro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-[oklch(0.90_0.02_300)]"
              />
            </div>

            <div>
              <label className="text-xs font-sans tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-1 block">
                Contraseña
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-[oklch(0.90_0.02_300)]"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] py-2.5 mt-2 transition-all"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">403</h1>
        <p className="text-sm font-sans font-light text-[oklch(0.50_0.03_295)]">Access denied</p>
        <Button asChild variant="ghost" className="rounded-full border border-[oklch(0.70_0.04_295/0.3)]">
          <a href={`/${lang}/`}>{t("admin.backToSite")}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">{t("admin.title")}</h1>
            <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mt-1">
              {user.name || user.email}
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full border border-[oklch(0.70_0.04_295/0.3)] text-sm">
            <a href={`/${lang}/`}><ArrowLeft className="w-4 h-4 mr-2" />{t("admin.backToSite")}</a>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8 rounded-full bg-[oklch(0.94_0.02_300)] p-1">
            <TabsTrigger value="gallery" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              <ImageIcon className="w-4 h-4 mr-2" />{t("admin.gallery")}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              {t("admin.reviews")}
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              {t("admin.messages")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-[oklch(0.55_0.08_295)] data-[state=active]:text-[oklch(0.98_0.01_300)] text-sm">
              <Settings className="w-4 h-4 mr-2" />{t("admin.settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery"><GalleryAdmin /></TabsContent>
          <TabsContent value="reviews"><ReviewsAdmin lang={lang} t={t} /></TabsContent>
          <TabsContent value="messages"><MessagesAdmin lang={lang} t={t} /></TabsContent>
          <TabsContent value="settings"><SettingsAdmin lang={lang} t={t} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== Gallery Admin =====
function GalleryAdmin() {
  const { t } = useI18n();
  const { data: photosData, isLoading } = trpc.gallery.list.useQuery();
  const photos = Array.isArray(photosData) ? photosData : [];

  const uploadMutation = trpc.gallery.upload.useMutation();
  const deleteMutation = trpc.gallery.delete.useMutation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileBase64: base64,
          contentType: selectedFile.type || "image/jpeg",
          title: title || undefined,
          category: category || undefined,
        });
        toast.success(t("admin.uploadSuccess"));
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        setCategory("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        utils.gallery.list.invalidate();
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      toast.error(t("admin.uploadError"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.gallery.list.invalidate();
      toast.success("OK");
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
        <h3 className="font-serif text-xl text-[oklch(0.30_0.05_295)] mb-4">{t("admin.uploadPhoto")}</h3>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
              {t("admin.photoFile")}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm font-sans font-light text-[oklch(0.45_0.04_295)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-sans file:bg-[oklch(0.85_0.06_295/0.3)] file:text-[oklch(0.35_0.05_295)] hover:file:bg-[oklch(0.85_0.06_295/0.5)] cursor-pointer"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                {t("admin.photoTitle")}
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]" />
            </div>
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                {t("admin.photoCategory")}
              </label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
              {t("admin.photoDescription")}
            </label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] resize-none" />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-6"
            >
              {uploadMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("admin.uploading")}</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />{t("admin.upload")}</>
              )}
            </Button>
            {selectedFile && (
              <Button variant="ghost" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="rounded-full">
                {t("admin.cancel")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : photos.length === 0 ? (
        <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noPhotos")}</p>
      ) : (
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo: any) => (
            <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden border border-[oklch(0.90_0.02_300/0.3)]">
              <img src={photo.imageUrl} alt={photo.title || ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[oklch(0.20_0.03_295/0.7)] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                {photo.title && <p className="text-white text-xs font-serif text-center line-clamp-2">{photo.title}</p>}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />{t("admin.delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Reviews Admin =====
function ReviewsAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const { data: reviewsData, isLoading, error } = trpc.reviews.listAll.useQuery();
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  const approveMutation = trpc.reviews.approve.useMutation();
  const rejectMutation = trpc.reviews.reject.useMutation();
  const deleteMutation = trpc.reviews.delete.useMutation();
  const utils = trpc.useUtils();

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
      toast.success("Reseña aprobada");
    } catch (err: any) {
      toast.error(err?.message || "Error al aprobar");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync({ id });
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
      toast.success("Reseña rechazada");
    } catch (err: any) {
      toast.error(err?.message || "Error al rechazar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar esta reseña?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
      toast.success("Reseña borrada");
    } catch (err: any) {
      toast.error(err?.message || "Error al borrar");
    }
  };

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;

  if (error) {
    return (
      <p className="text-center text-sm font-sans text-red-500 py-12">
        Error al cargar reseñas: {error.message}
      </p>
    );
  }

  if (reviews.length === 0)
    return <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noReviews")}</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <div key={review.id} className="corner-bracket p-5 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.85_0.06_295/0.4)] to-[oklch(0.88_0.04_350/0.3)] flex items-center justify-center">
                <span className="font-serif text-sm text-[oklch(0.40_0.05_295)]">{review.authorName?.charAt(0)?.toUpperCase() || "A"}</span>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-[oklch(0.35_0.05_295)]">{review.authorName}</p>
                <span className={`text-[10px] uppercase tracking-wider font-sans px-2 py-0.5 rounded-full ${
                  review.approved === "approved" ? "bg-green-100 text-green-700" :
                  review.approved === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {review.approved === "approved" ? "Aprobada" : review.approved === "rejected" ? "Rechazada" : "Pendiente"}
                </span>
              </div>
            </div>
            <StarRating rating={review.rating} size={14} />
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] italic mb-4">"{review.comment}"</p>
          <div className="flex gap-2">
            {review.approved !== "approved" && (
              <Button size="sm" onClick={() => handleApprove(review.id)} className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs">
                Aprobar
              </Button>
            )}
            {review.approved !== "rejected" && (
              <Button size="sm" variant="outline" onClick={() => handleReject(review.id)} className="rounded-full text-xs">
                Rechazar
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => handleDelete(review.id)} className="rounded-full text-xs">
              <Trash2 className="w-3 h-3 mr-1" />Borrar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Messages Admin =====
function MessagesAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const { data: messagesData, isLoading } = trpc.contact.listAll.useQuery();
  const messages = Array.isArray(messagesData) ? messagesData : [];

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
  if (messages.length === 0)
    return <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noMessages")}</p>;

  return (
    <div className="space-y-4">
      {messages.map((msg: any) => (
        <div key={msg.id} className="corner-bracket p-5 rounded-lg border bg-[oklch(0.97_0.012_300/0.3)] border-[oklch(0.90_0.02_300/0.2)]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[oklch(0.50_0.03_295)]" />
              <div>
                <p className="font-sans text-sm font-medium text-[oklch(0.35_0.05_295)]">{msg.name}</p>
                <a href={`mailto:${msg.email}`} className="text-xs font-sans font-light text-[oklch(0.55_0.06_295)] hover:underline">{msg.email}</a>
              </div>
            </div>
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
        </div>
      ))}
    </div>
  );
}

// ===== Settings Admin =====

// Small labeled field wrapper shared by both settings cards
function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-sans tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-1 block">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] font-sans text-[oklch(0.55_0.04_295)] mt-1">{hint}</p>}
    </div>
  );
}

const TEXT_LANGS = ["es", "en", "pt"] as const;

type TextsForm = {
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  footerTagline: string;
};

type ContactForm = {
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  mountainStatusUrl: string;
};

function SettingsAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const utils = trpc.useUtils();
  const saveMutation = trpc.config.save.useMutation();

  // ---- Textos del sitio ----
  const [textLang, setTextLang] = useState<string>(lang);
  const { data: textsConfig, isLoading: textsLoading } = trpc.config.getByCategory.useQuery({
    category: `texts_${textLang}`,
  });
  const [texts, setTexts] = useState<TextsForm>({
    heroTagline: "",
    heroTitle: "",
    heroSubtitle: "",
    aboutText: "",
    footerTagline: "",
  });
  const [loadedTextLang, setLoadedTextLang] = useState<string | null>(null);

  if (Array.isArray(textsConfig) && loadedTextLang !== textLang) {
    const map: Record<string, string> = {};
    textsConfig.forEach((c: any) => {
      map[c.configKey] = c.configValue;
    });
    setTexts({
      heroTagline: map.hero_tagline || "",
      heroTitle: map.hero_title || "",
      heroSubtitle: map.hero_subtitle || "",
      aboutText: map.about_text || "",
      footerTagline: map.footer_tagline || "",
    });
    setLoadedTextLang(textLang);
  }

  const handleSaveTexts = async () => {
    const items = [
      { configKey: "hero_tagline", configValue: texts.heroTagline },
      { configKey: "hero_title", configValue: texts.heroTitle },
      { configKey: "hero_subtitle", configValue: texts.heroSubtitle },
      { configKey: "about_text", configValue: texts.aboutText },
      { configKey: "footer_tagline", configValue: texts.footerTagline },
    ];
    try {
      await saveMutation.mutateAsync({ category: `texts_${textLang}`, items });
      toast.success(t("admin.settings.saved"));
      utils.config.getByCategory.invalidate({ category: `texts_${textLang}` });
    } catch (err: any) {
      toast.error(err?.message || t("admin.settings.error"));
    }
  };

  // ---- Tarifas ----
  // Igual que "Textos del sitio" arriba: una pestaña por idioma, guardado en
  // la categoría services_<lang>. La categoría legacy "services" (sin
  // sufijo de idioma) solo se lee como valor inicial para no perder contenido
  // cargado antes de este fix — una vez que guardás en una pestaña, esa
  // pestaña pasa a tener su propia config y deja de mirar la legacy.
  const [pricingLang, setPricingLang] = useState<string>(lang);
  const { data: pricingConfig, isLoading: pricingLoading } = trpc.config.getByCategory.useQuery({
    category: `services_${pricingLang}`,
  });
  const { data: legacyPricingConfig } = trpc.config.getByCategory.useQuery({ category: "services" });
  type PricingForm = Record<string, { title: string; desc: string; price: string }>;
  const [pricing, setPricing] = useState<PricingForm>(() => {
    const initial: PricingForm = {};
    SERVICE_DEFS.forEach((s) => {
      initial[s.key] = { title: "", desc: "", price: "" };
    });
    return initial;
  });
  const [loadedPricingLang, setLoadedPricingLang] = useState<string | null>(null);

  if (Array.isArray(pricingConfig) && loadedPricingLang !== pricingLang) {
    const map: Record<string, string> = {};
    pricingConfig.forEach((c: any) => {
      map[c.configKey] = c.configValue;
    });
    const legacyMap: Record<string, string> = {};
    if (Array.isArray(legacyPricingConfig)) {
      legacyPricingConfig.forEach((c: any) => {
        legacyMap[c.configKey] = c.configValue;
      });
    }
    const next: PricingForm = {};
    SERVICE_DEFS.forEach((s) => {
      next[s.key] = {
        title: map[`service_${s.key}_title`] || legacyMap[`service_${s.key}_title`] || "",
        desc: map[`service_${s.key}_desc`] || legacyMap[`service_${s.key}_desc`] || "",
        price: map[`service_${s.key}_price`] || legacyMap[`service_${s.key}_price`] || "",
      };
    });
    setPricing(next);
    setLoadedPricingLang(pricingLang);
  }

  const updatePricing = (key: string, field: "title" | "desc" | "price", value: string) => {
    setPricing((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSavePricing = async () => {
    const items = SERVICE_DEFS.flatMap((s) => [
      { configKey: `service_${s.key}_title`, configValue: pricing[s.key]?.title || "" },
      { configKey: `service_${s.key}_desc`, configValue: pricing[s.key]?.desc || "" },
      { configKey: `service_${s.key}_price`, configValue: pricing[s.key]?.price || "" },
    ]);
    try {
      await saveMutation.mutateAsync({ category: `services_${pricingLang}`, items });
      toast.success(t("admin.settings.saved"));
      utils.config.getByCategory.invalidate({ category: `services_${pricingLang}` });
    } catch (err: any) {
      toast.error(err?.message || t("admin.settings.error"));
    }
  };

  // ---- Medios de contacto ----
  const { data: contactConfig, isLoading: contactLoading } = trpc.config.getByCategory.useQuery({
    category: "contact",
  });
  const [contact, setContact] = useState<ContactForm>({
    whatsapp: "",
    email: "",
    instagram: "",
    location: "",
    mountainStatusUrl: "",
  });
  const [contactLoaded, setContactLoaded] = useState(false);

  if (Array.isArray(contactConfig) && !contactLoaded) {
    const map: Record<string, string> = {};
    contactConfig.forEach((c: any) => {
      map[c.configKey] = c.configValue;
    });
    setContact({
      whatsapp: map.whatsapp || "",
      email: map.email || "",
      instagram: map.instagram || "",
      location: map.location || "",
      mountainStatusUrl: map.mountain_status_url || "",
    });
    setContactLoaded(true);
  }

  const handleSaveContact = async () => {
    const items = [
      { configKey: "whatsapp", configValue: contact.whatsapp },
      { configKey: "email", configValue: contact.email },
      { configKey: "instagram", configValue: contact.instagram },
      { configKey: "location", configValue: contact.location },
      { configKey: "mountain_status_url", configValue: contact.mountainStatusUrl },
    ];
    try {
      await saveMutation.mutateAsync({ category: "contact", items });
      toast.success(t("admin.settings.saved"));
      utils.config.getByCategory.invalidate({ category: "contact" });
    } catch (err: any) {
      toast.error(err?.message || t("admin.settings.error"));
    }
  };

  const inputCls = "rounded-lg bg-white border-[oklch(0.90_0.02_300)]";

  return (
    <div className="space-y-6">
      {/* Textos del sitio */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-2xl border border-[oklch(0.90_0.02_300/0.3)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-serif text-xl text-[oklch(0.30_0.05_295)]">{t("admin.settings.texts")}</h2>
          <div className="flex gap-1">
            {TEXT_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setTextLang(l)}
                className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-colors ${
                  textLang === l
                    ? "bg-[oklch(0.55_0.08_295)] text-white"
                    : "text-[oklch(0.50_0.04_295)] border border-[oklch(0.70_0.04_295/0.3)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {textsLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[oklch(0.55_0.06_295)]">
                {t("admin.settings.hero")}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <SettingsField label={t("admin.settings.heroTagline")}>
                  <Input
                    value={texts.heroTagline}
                    onChange={(e) => setTexts((p) => ({ ...p, heroTagline: e.target.value }))}
                    className={inputCls}
                  />
                </SettingsField>
                <SettingsField label={t("admin.settings.heroTitle")}>
                  <Input
                    value={texts.heroTitle}
                    onChange={(e) => setTexts((p) => ({ ...p, heroTitle: e.target.value }))}
                    className={inputCls}
                  />
                </SettingsField>
              </div>
              <SettingsField label={t("admin.settings.heroSubtitle")}>
                <Textarea
                  rows={2}
                  value={texts.heroSubtitle}
                  onChange={(e) => setTexts((p) => ({ ...p, heroSubtitle: e.target.value }))}
                  className={`${inputCls} resize-y`}
                />
              </SettingsField>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[oklch(0.55_0.06_295)]">
                {t("admin.settings.about")}
              </p>
              <SettingsField label={t("admin.settings.aboutText")}>
                <Textarea
                  rows={3}
                  value={texts.aboutText}
                  onChange={(e) => setTexts((p) => ({ ...p, aboutText: e.target.value }))}
                  className={`${inputCls} resize-y`}
                />
              </SettingsField>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[oklch(0.55_0.06_295)]">
                {t("admin.settings.footer")}
              </p>
              <SettingsField label={t("admin.settings.footerTagline")}>
                <Input
                  value={texts.footerTagline}
                  onChange={(e) => setTexts((p) => ({ ...p, footerTagline: e.target.value }))}
                  className={inputCls}
                />
              </SettingsField>
            </div>

            <Button
              onClick={handleSaveTexts}
              disabled={saveMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-white text-sm"
            >
              {saveMutation.isPending ? "..." : t("admin.settings")}
            </Button>
          </>
        )}
      </div>

      {/* Tarifas */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-2xl border border-[oklch(0.90_0.02_300/0.3)] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-serif text-xl text-[oklch(0.30_0.05_295)]">{t("admin.settings.pricing")}</h2>
          <div className="flex gap-1">
            {TEXT_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setPricingLang(l)}
                className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-colors ${
                  pricingLang === l
                    ? "bg-[oklch(0.55_0.08_295)] text-white"
                    : "text-[oklch(0.50_0.04_295)] border border-[oklch(0.70_0.04_295/0.3)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {pricingLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <>
            {SERVICE_DEFS.map((s) => (
              <div key={s.key} className="space-y-3 pb-4 border-b border-[oklch(0.90_0.02_300/0.4)] last:border-b-0 last:pb-0">
                <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[oklch(0.55_0.06_295)]">
                  {s.label}
                </p>
                <div className="grid sm:grid-cols-[1fr_2fr_1fr] gap-4">
                  <SettingsField label={t("admin.settings.serviceTitle")}>
                    <Input
                      value={pricing[s.key]?.title || ""}
                      onChange={(e) => updatePricing(s.key, "title", e.target.value)}
                      className={inputCls}
                    />
                  </SettingsField>
                  <SettingsField label={t("admin.settings.serviceDesc")}>
                    <Input
                      value={pricing[s.key]?.desc || ""}
                      onChange={(e) => updatePricing(s.key, "desc", e.target.value)}
                      className={inputCls}
                    />
                  </SettingsField>
                  <SettingsField label={t("admin.settings.servicePrice")}>
                    <Input
                      value={pricing[s.key]?.price || ""}
                      onChange={(e) => updatePricing(s.key, "price", e.target.value)}
                      className={inputCls}
                    />
                  </SettingsField>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSavePricing}
              disabled={saveMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-white text-sm"
            >
              {saveMutation.isPending ? "..." : t("admin.settings")}
            </Button>
          </>
        )}
      </div>

      {/* Medios de contacto */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-2xl border border-[oklch(0.90_0.02_300/0.3)] space-y-4">
        <h2 className="font-serif text-xl text-[oklch(0.30_0.05_295)]">{t("admin.settings.contact")}</h2>

        {contactLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <SettingsField label={t("admin.settings.whatsapp")}>
                <Input
                  value={contact.whatsapp}
                  onChange={(e) => setContact((p) => ({ ...p, whatsapp: e.target.value }))}
                  className={inputCls}
                />
              </SettingsField>
              <SettingsField label={t("admin.settings.email")}>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                  className={inputCls}
                />
              </SettingsField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <SettingsField label={t("admin.settings.instagram")}>
                <Input
                  value={contact.instagram}
                  onChange={(e) => setContact((p) => ({ ...p, instagram: e.target.value }))}
                  className={inputCls}
                />
              </SettingsField>
              <SettingsField label={t("admin.settings.location")}>
                <Input
                  value={contact.location}
                  onChange={(e) => setContact((p) => ({ ...p, location: e.target.value }))}
                  className={inputCls}
                />
              </SettingsField>
            </div>

            <SettingsField label={t("admin.settings.mountainStatusUrl")} hint={t("admin.settings.mountainStatus")}>
              <Input
                placeholder={t("admin.settings.mountainStatusUrlPlaceholder")}
                value={contact.mountainStatusUrl}
                onChange={(e) => setContact((p) => ({ ...p, mountainStatusUrl: e.target.value }))}
                className={inputCls}
              />
            </SettingsField>

            <Button
              onClick={handleSaveContact}
              disabled={saveMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-white text-sm"
            >
              {saveMutation.isPending ? "..." : t("admin.settings")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
