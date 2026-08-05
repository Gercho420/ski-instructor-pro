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

export default function Admin() {
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState("gallery");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = trpc.auth.login.useMutation();
  const utils = trpc.useUtils();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success("Sesión iniciada correctamente");
      utils.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Email o contraseña incorrectos");
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
        <div className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-[oklch(0.90_0.02_300/0.5)] shadow-xl">
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
              disabled={loginMutation.isPending}
              className="w-full rounded-xl bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] py-2.5 mt-2 transition-all"
            >
              {loginMutation.isPending ? (
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
          <a href="/">{t("admin.backToSite")}</a>
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
            <a href="/"><ArrowLeft className="w-4 h-4 mr-2" />{t("admin.backToSite")}</a>
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
  const { data: reviewsData, isLoading } = trpc.reviews.listApproved.useQuery();
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  const approveMutation = trpc.reviews.approve.useMutation();
  const utils = trpc.useUtils();

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
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
              </div>
            </div>
            <StarRating rating={review.rating} size={14} />
          </div>
          <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] italic mb-4">"{review.comment}"</p>
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
function SettingsAdmin({ lang, t }: { lang: string; t: (key: string) => string }) {
  return (
    <div className="p-6 bg-white/50 rounded-lg border text-sm text-gray-500">
      Configuraciones generales de la plataforma.
    </div>
  );
}
