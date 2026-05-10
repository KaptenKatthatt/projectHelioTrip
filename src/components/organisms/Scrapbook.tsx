import { useCallback, useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { type Photo, loadAllPhotos, deletePhoto } from '../../lib/photoStore';

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
          <h2 className="text-2xl font-bold tracking-tight">Mitt Fotoalbum</h2>
          <p className="text-xs tracking-widest text-white/40 uppercase">
            {photos.length} foton sparade
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
          <div className="flex h-full flex-col items-center justify-center text-white/50">
            <div className="mb-4 rounded-full bg-white/5 p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-20"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <p>Här var det tomt!</p>
            <p className="mt-1 text-sm opacity-60">
              Fånga universums skönhet med kameran så dyker dina foton upp här.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-white/30"
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.locationLabel}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-6">
                  <p className="truncate text-[10px] font-bold tracking-wider uppercase">
                    {photo.locationLabel}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Viewer / Carousel */}
      {selectedPhoto ? (
        <div className="animate-in fade-in zoom-in fixed inset-0 z-[110] flex flex-col bg-black/98 backdrop-blur-2xl duration-300">
          <div className="absolute top-6 right-6 z-20 flex gap-2">
            <button
              type="button"
              onClick={() => handleDelete(selectedPhoto.id)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition hover:bg-red-500 hover:text-white"
              title="Ta bort foto"
              aria-label="Ta bort foto"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Stäng"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center p-4">
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90"
              aria-label="Föregående foto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="relative max-h-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl ring-1 shadow-black/50 ring-white/10">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.locationLabel}
                className="max-h-[85vh] w-auto object-contain"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                <h3 className="text-2xl font-black tracking-tighter text-white uppercase">
                  {selectedPhoto.locationLabel}
                </h3>
                <p className="text-sm font-medium text-white/50">
                  Taget den {new Date(selectedPhoto.timestampMs).toLocaleDateString()} kl{' '}
                  {new Date(selectedPhoto.timestampMs).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90"
              aria-label="Nästa foto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="p-6 text-center text-xs font-bold tracking-[0.3em] text-white/20 uppercase">
            {selectedIndex !== null ? selectedIndex + 1 : 0} / {photos.length}
          </div>
        </div>
      ) : null}
    </div>
  );
};
