import { Camera } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";
import { requestCanvasCapture } from "../../lib/captureBus";
import { savePhoto } from "../../lib/photoStore";
import { Scrapbook } from "../organisms/Scrapbook";

export type CameraToolProps = {
  readonly className?: string;
  readonly vertical?: boolean;
};

export const CameraTool = ({ className, vertical = true }: CameraToolProps) => {
  const { t, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const [flash, setFlash] = useState(false);

  const [scrapbookOpen, setScrapbookOpen] = useState(false);

  const takePhoto = async () => {
    // Show flash
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    /**
     * Served from inside the render loop, where the drawing buffer still
     * holds the finished frame. Reading it here instead would require
     * `preserveDrawingBuffer`, which costs every frame of every session.
     */
    let dataUrl: string;
    try {
      dataUrl = await requestCanvasCapture();
    } catch (error) {
      console.warn("HelioTrip: could not capture the current frame.", error);
      return;
    }

    // Determine location string
    const locationLabel = activeBody ? bodyName(activeBody) : "Deep Space";

    await savePhoto({
      id: crypto.randomUUID(),
      dataUrl,
      timestampMs: Date.now(),
      locationLabel,
    });

    useStore.getState().recordPhotoTaken(activeBody);
  };

  return (
    <>
      <div className={`pointer-events-auto flex gap-3 ${vertical ? "flex-col" : "flex-row"} ${className ?? ""}`}>
        <button
          type="button"
          onClick={takePhoto}
          aria-label={t.scrapbook.takePhoto}
          title={t.scrapbook.takePhoto}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Camera className="h-6 w-6" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setScrapbookOpen(true)}
          aria-label={t.scrapbook.viewAlbum}
          title={t.scrapbook.viewAlbum}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${vertical ? "mx-auto" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </button>
      </div>

      {flash && (
        <div className="pointer-events-none fixed inset-0 z-[100] bg-white opacity-80 transition-opacity duration-300" />
      )}

      <Scrapbook open={scrapbookOpen} onClose={() => setScrapbookOpen(false)} />
    </>
  );
};
