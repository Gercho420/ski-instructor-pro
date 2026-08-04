import { useI18n } from "@/i18n/I18nContext";
import { Facebook, Twitter, MessageCircle, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareButtons() {
  const { t } = useI18n();

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "SkiPro | Clases de Ski Profesionales";
  const shareText = "Instructor de ski certificado con más de 15 años de experiencia. Clases personalizadas para todos los niveles.";

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("share.copied"));
    } catch {
      toast.error(t("share.copyLink"));
    }
  };

  const buttonClass =
    "w-10 h-10 flex items-center justify-center rounded-full border border-[oklch(0.80_0.02_300/0.4)] text-[oklch(0.50_0.04_295)] hover:text-[oklch(0.55_0.08_295)] hover:border-[oklch(0.60_0.06_295/0.5)] transition-all duration-200 active:scale-90 hover:bg-[oklch(0.97_0.012_300/0.6)]";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.55_0.04_295)] mr-1">
        {t("share.title")}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={handleFacebook}
          className={buttonClass}
          aria-label={t("share.facebook")}
          title={t("share.facebook")}
        >
          <Facebook size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleTwitter}
          className={buttonClass}
          aria-label={t("share.twitter")}
          title={t("share.twitter")}
        >
          <Twitter size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleWhatsApp}
          className={buttonClass}
          aria-label={t("share.whatsapp")}
          title={t("share.whatsapp")}
        >
          <MessageCircle size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleCopyLink}
          className={buttonClass}
          aria-label={t("share.copyLink")}
          title={t("share.copyLink")}
        >
          <Link2 size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
