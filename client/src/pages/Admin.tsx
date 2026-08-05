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
