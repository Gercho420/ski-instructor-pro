import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/StarRating";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Check, X, MailOpen, Mail, ArrowLeft, Loader2, Image as ImageIcon, Settings } from "lucide-react";
import { LANGS, translations } from "@/i18n/translations";

type Lang = "es" | "en" | "pt";

export default function Admin() {
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState("gallery");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.55_0.08_295)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">{t("admin.loginRequired")}</h1>
        <Button
          onClick={() => startLogin()}
          className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-8 py-3"
        >
          {t("admin.login")}
        </Button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">403</h1>
        <p className="text-sm font-sans font-light text-[oklch(0.50_0.03_295)]">Access denied</p>
        <Button asChild variant="ghost" className="rounded-full border border-[oklch(0.70_0.04_295/0.3)]">
          <a href="/">{t("admin.backToSite")}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[oklch(0.30_0.05_295)]">{t("admin.title")}</h1>
            <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mt-1">
              {user.name || user.email}
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full border border-[oklch(0.70_0.04_295/0.3)] text-sm">
            <a href="/"><ArrowLeft className="w-4 h-4 mr-2" />{t("admin.backToSite")}</a>
          </Button>
        </div>

        {/* Tabs */}
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
  const { data: photos, isLoading } = trpc.gallery.list.useQuery();
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
          description: description || undefined,
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
      {/* Upload form */}
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

      {/* Photo grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : !photos || photos.length === 0 ? (
        <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noPhotos")}</p>
      ) : (
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
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
  const { data: reviews, isLoading } = trpc.reviews.listAll.useQuery();
  const approveMutation = trpc.reviews.approve.useMutation();
  const rejectMutation = trpc.reviews.reject.useMutation();
  const deleteMutation = trpc.reviews.delete.useMutation();
  const utils = trpc.useUtils();

  const handleAction = async (action: "approve" | "reject" | "delete", id: number) => {
    if (action === "delete" && !confirm(t("admin.confirmDelete"))) return;
    try {
      if (action === "approve") await approveMutation.mutateAsync({ id });
      if (action === "reject") await rejectMutation.mutateAsync({ id });
      if (action === "delete") await deleteMutation.mutateAsync({ id });
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
      toast.success("OK");
    } catch {
      toast.error("Error");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-[oklch(0.85_0.08_70/0.3)] text-[oklch(0.45_0.08_70)]",
      approved: "bg-[oklch(0.85_0.08_160/0.3)] text-[oklch(0.35_0.08_160)]",
      rejected: "bg-[oklch(0.85_0.08_20/0.3)] text-[oklch(0.45_0.08_20)]",
    };
    const labels: Record<string, string> = {
      pending: t("admin.pending"),
      approved: t("admin.approved"),
      rejected: t("admin.rejected"),
    };
    return <span className={`text-xs px-2 py-1 rounded-full font-sans font-light ${colors[status]}`}>{labels[status]}</span>;
  };

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
  if (!reviews || reviews.length === 0)
    return <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noReviews")}</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="corner-bracket p-5 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.85_0.06_295/0.4)] to-[oklch(0.88_0.04_350/0.3)] flex items-center justify-center">
                <span className="font-serif text-sm text-[oklch(0.40_0.05_295)]">{review.authorName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-[oklch(0.35_0.05_295)]">{review.authorName}</p>
                <p className="text-xs font-sans font-light text-[oklch(0.50_0.03_295)]">
                  {new Date(review.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : lang === "pt" ? "pt-BR" : "en-US")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} size={14} />
              {statusBadge(review.approved)}
            </div>
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] italic mb-4">"{review.comment}"</p>
          <div className="flex gap-2">
            {review.approved !== "approved" && (
              <Button size="sm" onClick={() => handleAction("approve", review.id)} className="rounded-full h-8 px-3 text-xs bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)]">
                <Check className="w-3 h-3 mr-1" />{t("admin.approve")}
              </Button>
            )}
            {review.approved !== "rejected" && (
              <Button size="sm" variant="ghost" onClick={() => handleAction("reject", review.id)} className="rounded-full h-8 px-3 text-xs border border-[oklch(0.70_0.04_295/0.3)]">
                <X className="w-3 h-3 mr-1" />{t("admin.reject")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => handleAction("delete", review.id)} className="rounded-full h-8 px-3 text-xs text-[oklch(0.62_0.12_20)] hover:bg-[oklch(0.90_0.05_20/0.2)]">
              <Trash2 className="w-3 h-3 mr-1" />{t("admin.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Messages Admin =====
function MessagesAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const { data: messages, isLoading } = trpc.contact.listAll.useQuery();
  const markReadMutation = trpc.contact.markRead.useMutation();
  const deleteMutation = trpc.contact.delete.useMutation();
  const utils = trpc.useUtils();

  const handleMarkRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync({ id });
      utils.contact.listAll.invalidate();
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.contact.listAll.invalidate();
      toast.success("OK");
    } catch {
      toast.error("Error");
    }
  };

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
  if (!messages || messages.length === 0)
    return <p className="text-center text-sm font-sans font-light text-[oklch(0.50_0.03_295)] py-12">{t("admin.noMessages")}</p>;

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`corner-bracket p-5 rounded-lg border transition-colors ${msg.read === "unread" ? "bg-[oklch(0.95_0.03_295/0.4)] border-[oklch(0.80_0.05_295/0.3)]" : "bg-[oklch(0.97_0.012_300/0.3)] border-[oklch(0.90_0.02_300/0.2)]"}`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              {msg.read === "unread" ? <Mail className="w-5 h-5 text-[oklch(0.55_0.08_295)]" /> : <MailOpen className="w-5 h-5 text-[oklch(0.50_0.03_295)]" />}
              <div>
                <p className="font-sans text-sm font-medium text-[oklch(0.35_0.05_295)]">{msg.name}</p>
                <a href={`mailto:${msg.email}`} className="text-xs font-sans font-light text-[oklch(0.55_0.06_295)] hover:underline">{msg.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-light text-[oklch(0.50_0.03_295)]">
                {new Date(msg.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : lang === "pt" ? "pt-BR" : "en-US")}
              </span>
              {msg.read === "unread" && <span className="w-2 h-2 rounded-full bg-[oklch(0.55_0.08_295)]" />}
            </div>
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed mb-4 whitespace-pre-wrap">{msg.message}</p>
          <div className="flex gap-2">
            {msg.read === "unread" && (
              <Button size="sm" variant="ghost" onClick={() => handleMarkRead(msg.id)} className="rounded-full h-8 px-3 text-xs border border-[oklch(0.70_0.04_295/0.3)]">
                <MailOpen className="w-3 h-3 mr-1" />{t("admin.markRead")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id)} className="rounded-full h-8 px-3 text-xs text-[oklch(0.62_0.12_20)] hover:bg-[oklch(0.90_0.05_20/0.2)]">
              <Trash2 className="w-3 h-3 mr-1" />{t("admin.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Settings Admin =====
const SERVICE_TYPES = ["beginner", "intermediate", "advanced", "private", "group", "kids"] as const;

function SettingsAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  const [settingsLang, setSettingsLang] = useState<Lang>(lang as Lang);
  const { data: pricingData, isLoading: loadingPricing } = trpc.config.getByCategory.useQuery({ category: `pricing_${settingsLang}` });
  const { data: textsData, isLoading: loadingTexts } = trpc.config.getByCategory.useQuery({ category: `texts_${settingsLang}` });
  const { data: contactData, isLoading: loadingContact } = trpc.config.getByCategory.useQuery({ category: "contact" });

  const saveMutation = trpc.config.save.useMutation();
  const utils = trpc.useUtils();

  // Pricing state
  const [pricing, setPricing] = useState<Record<string, { title: string; desc: string; price: string }>>({});
  const [texts, setTexts] = useState({
    heroTagline: "",
    heroTitle: "",
    heroSubtitle: "",
    aboutText: "",
    footerTagline: "",
  });
  const [contact, setContact] = useState({
    whatsapp: "",
    email: "",
    instagram: "",
    location: "",
    mountainStatusUrl: "",
  });

  // Load pricing from DB into local state
  useEffect(() => {
    if (pricingData) {
      const values: Record<string, { title: string; desc: string; price: string }> = {};
      SERVICE_TYPES.forEach((type) => {
        const titleEntry = pricingData.find(r => r.configKey === `${type}_title`);
        const descEntry = pricingData.find(r => r.configKey === `${type}_desc`);
        const priceEntry = pricingData.find(r => r.configKey === `${type}_price`);
        values[type] = {
          title: titleEntry?.configValue || translations[settingsLang][`services.${type}.title` as keyof typeof translations.en] || type,
          desc: descEntry?.configValue || translations[settingsLang][`services.${type}.desc` as keyof typeof translations.en] || "",
          price: priceEntry?.configValue || translations[settingsLang][`services.${type}.price` as keyof typeof translations.en] || "",
        };
      });
      setPricing(values);
    }
  }, [pricingData, settingsLang]);

  // Load texts from DB into local state
  useEffect(() => {
    if (textsData) {
      setTexts({
        heroTagline: textsData.find(r => r.configKey === "hero_tagline")?.configValue || translations[settingsLang]["hero.tagline"] || "",
        heroTitle: textsData.find(r => r.configKey === "hero_title")?.configValue || translations[settingsLang]["hero.title"] || "",
        heroSubtitle: textsData.find(r => r.configKey === "hero_subtitle")?.configValue || translations[settingsLang]["hero.subtitle"] || "",
        aboutText: textsData.find(r => r.configKey === "about_text")?.configValue || translations[settingsLang]["about.text"] || "",
        footerTagline: textsData.find(r => r.configKey === "footer_tagline")?.configValue || translations[settingsLang]["footer.tagline"] || "",
      });
    }
  }, [textsData, settingsLang]);

  // Load contact from DB into local state
  useEffect(() => {
    if (contactData) {
      setContact({
        whatsapp: contactData.find(r => r.configKey === "whatsapp")?.configValue || "+54 9 11 1234-5678",
        email: contactData.find(r => r.configKey === "email")?.configValue || "contact@skipro.com",
        instagram: contactData.find(r => r.configKey === "instagram")?.configValue || "@skipro",
        location: contactData.find(r => r.configKey === "location")?.configValue || "Buenos Aires, Argentina",
        mountainStatusUrl: contactData.find(r => r.configKey === "mountain_status_url")?.configValue || "",
      });
    }
  }, [contactData]);

  const handleSavePricing = async () => {
    const items = SERVICE_TYPES.flatMap((type) => [
      { configKey: `${type}_title`, configValue: pricing[type]?.title || "" },
      { configKey: `${type}_desc`, configValue: pricing[type]?.desc || "" },
      { configKey: `${type}_price`, configValue: pricing[type]?.price || "" },
    ]);
    try {
      await saveMutation.mutateAsync({ category: `pricing_${settingsLang}`, items });
      await utils.config.getByCategory.invalidate({ category: `pricing_${settingsLang}` });
      toast.success(t("admin.settings.saved"));
    } catch {
      toast.error(t("admin.settings.error"));
    }
  };

  const handleSaveTexts = async () => {
    const items = [
      { configKey: "hero_tagline", configValue: texts.heroTagline },
      { configKey: "hero_title", configValue: texts.heroTitle },
      { configKey: "hero_subtitle", configValue: texts.heroSubtitle },
      { configKey: "about_text", configValue: texts.aboutText },
      { configKey: "footer_tagline", configValue: texts.footerTagline },
    ];
    try {
      await saveMutation.mutateAsync({ category: `texts_${settingsLang}`, items });
      await utils.config.getByCategory.invalidate({ category: `texts_${settingsLang}` });
      toast.success(t("admin.settings.saved"));
    } catch {
      toast.error(t("admin.settings.error"));
    }
  };

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
      await utils.config.getByCategory.invalidate({ category: "contact" });
      toast.success(t("admin.settings.saved"));
    } catch {
      toast.error(t("admin.settings.error"));
    }
  };

  return (
    <div className="space-y-8">
      {/* Language selector for settings */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)]">{t("admin.settings.texts")}:</span>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={settingsLang === l ? "default" : "outline"}
              onClick={() => setSettingsLang(l)}
              className={`rounded-full text-xs ${settingsLang === l ? "bg-[oklch(0.55_0.08_295)] text-[oklch(0.98_0.01_300)]" : "border-[oklch(0.70_0.04_295/0.3)]"}`}
            >
              {l.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
        <h3 className="font-serif text-xl text-[oklch(0.30_0.05_295)] mb-4">{t("admin.settings.pricing")}</h3>
        {loadingPricing ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <div className="space-y-4">
            {SERVICE_TYPES.map((type) => (
              <div key={type} className="p-4 rounded-lg bg-[oklch(0.95_0.01_300/0.5)] border border-[oklch(0.90_0.02_300/0.2)]">
                <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.55_0.06_295)] mb-3">
                  {t(`services.${type}.title` as any)}
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.serviceTitle")}</label>
                    <Input
                      value={pricing[type]?.title || ""}
                      onChange={(e) => setPricing(prev => ({ ...prev, [type]: { ...prev[type], title: e.target.value } }))}
                      className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.serviceDesc")}</label>
                    <Input
                      value={pricing[type]?.desc || ""}
                      onChange={(e) => setPricing(prev => ({ ...prev, [type]: { ...prev[type], desc: e.target.value } }))}
                      className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.servicePrice")}</label>
                    <Input
                      value={pricing[type]?.price || ""}
                      onChange={(e) => setPricing(prev => ({ ...prev, [type]: { ...prev[type], price: e.target.value } }))}
                      className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={handleSavePricing}
              disabled={saveMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-6"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("admin.settings.saved").split(" ")[0]}
            </Button>
          </div>
        )}
      </div>

      {/* Texts Section */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
        <h3 className="font-serif text-xl text-[oklch(0.30_0.05_295)] mb-4">{t("admin.settings.texts")}</h3>
        {loadingTexts ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[oklch(0.95_0.01_300/0.5)] border border-[oklch(0.90_0.02_300/0.2)]">
              <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.55_0.06_295)] mb-3">{t("admin.settings.hero")}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.heroTagline")}</label>
                  <Input
                    value={texts.heroTagline}
                    onChange={(e) => setTexts(prev => ({ ...prev, heroTagline: e.target.value }))}
                    className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.heroTitle")}</label>
                  <Input
                    value={texts.heroTitle}
                    onChange={(e) => setTexts(prev => ({ ...prev, heroTitle: e.target.value }))}
                    className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.heroSubtitle")}</label>
                <Textarea
                  value={texts.heroSubtitle}
                  onChange={(e) => setTexts(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  rows={3}
                  className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] resize-none text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[oklch(0.95_0.01_300/0.5)] border border-[oklch(0.90_0.02_300/0.2)]">
              <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.55_0.06_295)] mb-3">{t("admin.settings.about")}</p>
              <div>
                <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.aboutText")}</label>
                <Textarea
                  value={texts.aboutText}
                  onChange={(e) => setTexts(prev => ({ ...prev, aboutText: e.target.value }))}
                  rows={5}
                  className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] resize-none text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[oklch(0.95_0.01_300/0.5)] border border-[oklch(0.90_0.02_300/0.2)]">
              <p className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.55_0.06_295)] mb-3">{t("admin.settings.footer")}</p>
              <div>
                <label className="text-xs font-sans font-light text-[oklch(0.50_0.04_295)] mb-1 block">{t("admin.settings.footerTagline")}</label>
                <Input
                  value={texts.footerTagline}
                  onChange={(e) => setTexts(prev => ({ ...prev, footerTagline: e.target.value }))}
                  className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)] text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveTexts}
              disabled={saveMutation.isPending}
              className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-6"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("admin.settings.saved").split(" ")[0]}
            </Button>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]">
        <h3 className="font-serif text-xl text-[oklch(0.30_0.05_295)] mb-4">{t("admin.settings.contact")}</h3>
        {loadingContact ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">{t("admin.settings.whatsapp")}</label>
              <Input
                value={contact.whatsapp}
                onChange={(e) => setContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+54 9 11 1234-5678"
                className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
              />
            </div>
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">{t("admin.settings.email")}</label>
              <Input
                value={contact.email}
                onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@skipro.com"
                className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
              />
            </div>
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">{t("admin.settings.instagram")}</label>
              <Input
                value={contact.instagram}
                onChange={(e) => setContact(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="@skipro"
                className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
              />
            </div>
            <div>
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">{t("admin.settings.location")}</label>
              <Input
                value={contact.location}
                onChange={(e) => setContact(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Buenos Aires, Argentina"
                className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">{t("admin.settings.mountainStatusUrl")}</label>
              <Input
                value={contact.mountainStatusUrl}
                onChange={(e) => setContact(prev => ({ ...prev, mountainStatusUrl: e.target.value }))}
                placeholder={t("admin.settings.mountainStatusUrlPlaceholder")}
                className="rounded-lg bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300)]"
              />
              <p className="text-xs font-sans text-[oklch(0.50_0.04_295/0.7)] mt-1">{t("admin.settings.mountainStatus")}</p>
            </div>
            <div className="sm:col-span-2">
              <Button
                onClick={handleSaveContact}
                disabled={saveMutation.isPending}
                className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] px-6"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t("admin.settings.saved").split(" ")[0]}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
