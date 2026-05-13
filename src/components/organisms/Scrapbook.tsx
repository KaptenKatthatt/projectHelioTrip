import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { type Photo, loadAllPhotos, deletePhoto } from '../../lib/photoStore';
import { ScrapbookEmptyState } from './ScrapbookEmptyState';
import { ScrapbookGrid } from './ScrapbookGrid';
import { ScrapbookFullscreenViewer } from './ScrapbookFullscreenViewer';

type ScrapbookProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export const Scrapbook = ({ open, onClose }: ScrapbookProps) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      void loadAllPhotos().then(setPhotos);
      return;
    }
    const id = requestAnimationFrame(() => {
      setSelectedIndex(null);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleDelete = async (id: string) => {
    await deletePhoto(id);
    const nextPhotos = photos.filter((p) => p.id !== id);
    setPhotos(nextPhotos);
    if (selectedIndex !== null && selectedIndex >= nextPhotos.length) {
      setSelectedIndex(nextPhotos.length > 0 ? nextPhotos.length - 1 : null);
    }
  };

  const nextPhoto = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % photos.length);
  }, [selectedIndex, photos.length]);

  const prevPhoto = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length]);

  useEffect(() => {
    if (!open || selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevPhoto();
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, photos.length, prevPhoto, nextPhoto]);

  if (!open) return null;

  const selectedPhoto = selectedIndex !== null ? photos.at(selectedIndex) : undefined;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 pt-10 text-white backdrop-blur-xl sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight">{t.scrapbook.albumTitle}</h2>
          <p className="text-xs tracking-widest text-white/40 uppercase">
            {t.scrapbook.photosSaved(photos.length)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          aria-label={t.ui.aboutClose}
        >
          <X className="h-6 w-6" />
        </button>
      </header>

      <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
        {photos.length === 0 ? (
          <ScrapbookEmptyState />
        ) : (
          <ScrapbookGrid photos={photos} onSelect={setSelectedIndex} />
        )}
      </div>

      {/* Fullscreen Viewer / Carousel */}
      {selectedPhoto ? (
        <ScrapbookFullscreenViewer
          selectedPhoto={selectedPhoto}
          selectedIndex={selectedIndex}
          totalPhotos={photos.length}
          onDelete={handleDelete}
          onClose={() => setSelectedIndex(null)}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      ) : null}
    </div>
  );
};
