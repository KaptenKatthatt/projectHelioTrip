import { X, Trash2 } from 'lucide-react';
import type { Photo } from '../../lib/photoStore';
import { useTranslation } from '../../hooks/useTranslation';

type ScrapbookFullscreenViewerProps = {
  readonly selectedPhoto: Photo;
  readonly selectedIndex: number | null;
  readonly totalPhotos: number;
  readonly onDelete: (id: string) => void;
  readonly onClose: () => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
};

export const ScrapbookFullscreenViewer = ({
  selectedPhoto,
  selectedIndex,
  totalPhotos,
  onDelete,
  onClose,
  onPrev,
  onNext,
}: ScrapbookFullscreenViewerProps) => {
  const { t } = useTranslation();
  return (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={selectedPhoto.locationLabel}
    className="animate-in fade-in zoom-in fixed inset-0 z-[110] flex flex-col bg-black/98 backdrop-blur-2xl duration-300"
  >
    <div className="absolute top-6 right-6 z-20 flex gap-2">
      <button
        type="button"
        onClick={() => onDelete(selectedPhoto.id)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition hover:bg-red-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
        title={t.scrapbook.deletePhoto}
        aria-label={t.scrapbook.deletePhoto}
      >
        <Trash2 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label={t.scrapbook.close}
      >
        <X className="h-6 w-6" />
      </button>
    </div>

    <div className="relative flex flex-1 items-center justify-center p-4">
      <button
        type="button"
        onClick={onPrev}
        className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label={t.scrapbook.prevPhoto}
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
          aria-hidden="true"
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
            {t.scrapbook.takenAt(
              new Date(selectedPhoto.timestampMs).toLocaleDateString(),
              new Date(selectedPhoto.timestampMs).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label={t.scrapbook.nextPhoto}
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
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

    <div className="p-6 text-center text-xs font-bold tracking-[0.3em] text-white/20 uppercase">
      {selectedIndex !== null ? selectedIndex + 1 : 0} / {totalPhotos}
    </div>
  </div>
  );
};
