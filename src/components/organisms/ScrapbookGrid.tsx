import type { Photo } from '../../lib/photoStore';

type ScrapbookGridProps = {
  readonly photos: Photo[];
  readonly onSelect: (index: number) => void;
};

export const ScrapbookGrid = ({ photos, onSelect }: ScrapbookGridProps) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {photos.map((photo, index) => (
      <button
        key={photo.id}
        type="button"
        onClick={() => onSelect(index)}
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
);
