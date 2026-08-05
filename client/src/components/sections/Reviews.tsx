import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

type Review = {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  approved: string;
  lang: string | null;
  createdAt: Date;
};

export default function Reviews() {
  const { t, lang } = useI18n();
  const { data: reviewsData, isLoading } = trpc.reviews.listApproved.useQuery();
  const createReview = trpc.reviews.create.useMutation();
  const utils = trpc.useUtils();

  // Blindaje para garantizar que reviews sea siempre un array seguro
  const reviews = Array.isArray(reviewsData)
    ? reviewsData
    : Array.isArray((reviewsData as any)?.reviews)
    ? (reviewsData as any).reviews
    : [];

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview.mutateAsync({
        authorName: name,
        rating,
        comment,
        lang,
      });
      toast.success(t("reviews.form.success"));
      setName("");
      setRating(5);
      setComment("");
      setOpen(false);
      utils.reviews.listApproved.invalidate();
    } catch {
      toast.error(t("reviews.form.error"));
    }
  };

  return (
    <section id="reviews" className="relative py-24 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)] mb-4">
            {t("reviews.subtitle")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.30_0.05_295)]">
            {t("reviews.title")}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.06_295/0.4)] to-transparent mx-auto mt-6" />
        </div>

        {/* Reviews list */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-sans font-light tracking-wide text-[oklch(0.50_0.03_295)] mb-8">
              {t("reviews.empty")}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {reviews.map((review: Review) => (
              <div
                key={review.id}
                className="corner-bracket p-6 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.85_0.06_295/0.4)] to-[oklch(0.88_0.04_350/0.3)] flex items-center justify-center">
                      <span className="font-serif text-sm text-[oklch(0.40_0.05_295)]">
                        {review.authorName?.charAt(0)?.toUpperCase() || "A"}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium tracking-wide text-[oklch(0.35_0.05_295)]">
                        {review.authorName}
                      </p>
                      <p className="text-xs font-sans font-light text-[oklch(0.50_0.03_295)]">
                        {new Date(review.createdAt).toLocaleDateString(
                          lang === "es" ? "es-ES" : lang === "pt" ? "pt-BR" : "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>
                <p className="text-sm font-sans font-light tracking-wide text-[oklch(0.45_0.04_295)] leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Write review button */}
        <div className="text-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full font-sans text-sm tracking-wider px-8 py-3 text-[oklch(0.40_0.04_295)] hover:text-[oklch(0.55_0.08_295)] hover:bg-transparent border border-[oklch(0.70_0.04_295/0.3)] transition-all duration-200 active:scale-95"
              >
                {t("reviews.write")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-[oklch(0.30_0.05_295)]">
                  {t("reviews.write")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                    {t("reviews.form.name")}
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("reviews.form.namePlaceholder")}
                    required
                    maxLength={255}
                    className="rounded-lg bg-[oklch(0.97_0.012_300)] border-[oklch(0.90_0.02_300)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                    {t("reviews.form.rating")}
                  </label>
                  <StarRating rating={rating} size={28} interactive onChange={setRating} />
                </div>
                <div>
                  <label className="text-xs font-sans font-light tracking-wider uppercase text-[oklch(0.50_0.04_295)] mb-2 block">
                    {t("reviews.form.comment")}
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("reviews.form.commentPlaceholder")}
                    required
                    maxLength={2000}
                    rows={4}
                    className="rounded-lg bg-[oklch(0.97_0.012_300)] border-[oklch(0.90_0.02_300)] resize-none"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="rounded-full">
                      {t("admin.cancel")}
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={createReview.isPending}
                    className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)]"
                  >
                    {createReview.isPending ? "..." : t("reviews.form.submit")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
