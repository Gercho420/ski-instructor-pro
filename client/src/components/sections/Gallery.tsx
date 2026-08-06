import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

type Photo = {
  id: number;
  title: string | null;
  description: string | null;
  imageUrl: string;
  storageKey: string;
  category: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function Gallery() {
  const { t } = useI18n();
  const { data: photosData, isLoading } = trpc.gallery.list.useQuery();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Blindaje para garantizar que photos siempre sea un array plano
  const photos = Array.isArray(photosData)
    ? photosData
    : Array.isArray((photosData as any)?.photos)
    ? (photosData as any).photos
    : [];

  return (
    <section id="gallery" className="relative py-24 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)] mb-4">
            {t("gallery.subtitle")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.30_0.05_295)]">
            {t("gallery.title")}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.06_295/0.4)] to-transparent mx-auto mt-6" />
        </div>

        {/* Gallery grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-sans font-light tracking-wide text-[oklch(0.50_0.03_295)]">
              {t("gallery.empty")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo: Photo, index: number) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer corner-bracket"
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || t("gallery.altFallback")}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.03_295/0.6)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  {photo.title && (
                    <p className="text-white font-serif text-sm tracking-wide">{photo.title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-[oklch(0.98_0.015_300)] border-[oklch(0.90_0.02_300/0.5)]">
          <DialogTitle className="sr-only">{selectedPhoto?.title || "Photo"}</DialogTitle>
          {selectedPhoto && (
            <div>
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || t("gallery.altFallback")}
                className="w-full max-h-[70vh] object-contain"
              />
              {(selectedPhoto.title || selectedPhoto.description) && (
                <div className="p-6">
                  {selectedPhoto.title && (
                    <h3 className="font-serif text-xl text-[oklch(0.30_0.05_295)] mb-2">
                      {selectedPhoto.title}
                    </h3>
                  )}
                  {selectedPhoto.description && (
                    <p className="text-sm font-sans font-light tracking-wide text-[oklch(0.45_0.04_295)]">
                      {selectedPhoto.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
