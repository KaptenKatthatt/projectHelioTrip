import { Info } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { AUTHOR_WEBSITE_URL } from "../../lib/footerLinks";
import { LanguageToggle } from "../molecules/LanguageToggle";

type AboutDialogProps = {
  readonly open?: boolean;
  readonly onClose?: () => void;
};

export const AboutDialog = ({ open: openProp, onClose }: AboutDialogProps = {}) => {
  const { t } = useTranslation();
  const [openInternal, setOpenInternal] = useState(false);
  const titleId = useId();
  const descId = useId();

  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openInternal;

  const handleClose = (): void => {
    if (controlled) onClose?.();
    else setOpenInternal(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, controlled, onClose]);

  return (
    <>
      {!controlled && (
        <button
          type="button"
          onClick={() => setOpenInternal(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? titleId : undefined}
          aria-label={t.ui.aboutOpen}
          className="pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/90 backdrop-blur-md transition hover:bg-white/10"
        >
          <Info className="h-4 w-4" aria-hidden />
        </button>
      )}

      {open
        ? createPortal(
            <div
              className="pointer-events-auto fixed inset-0 z-100 flex h-dvh max-h-dvh w-full max-w-screen min-h-0 flex-col sm:h-auto sm:max-h-none sm:min-h-0 sm:items-center sm:justify-center sm:p-6"
              role="presentation"
            >
              <button
                type="button"
                aria-label={t.ui.aboutClose}
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                onClick={handleClose}
              />
              <div className="relative z-10 flex w-full min-h-0 max-w-md flex-1 flex-col items-end gap-2 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:max-h-[min(90dvh,40rem)] sm:flex-none">
                <LanguageToggle />
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  aria-describedby={descId}
                  className="w-full shrink-0 rounded-2xl border border-white/10 bg-black/80 p-5 text-left text-sm text-white/90 shadow-xl backdrop-blur-md"
                >
                  <h2
                    id={titleId}
                    className="text-base font-semibold tracking-tight text-white"
                  >
                    {t.ui.aboutTitle}
                  </h2>
                  <div id={descId} className="mt-4 space-y-3 text-white/75">
                    <p>{t.ui.aboutP1}</p>
                    <p>{t.ui.aboutP2}</p>
                    <p>{t.ui.aboutP3}</p>
                    <p>{t.ui.aboutP4}</p>
                    <p>
                      <a
                        href={AUTHOR_WEBSITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white underline decoration-white/35 underline-offset-2 transition hover:decoration-white/70"
                      >
                        {t.ui.aboutAttribution}
                      </a>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-6 w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    {t.ui.aboutClose}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
