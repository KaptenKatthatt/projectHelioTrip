import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useStore } from "../store/useStore";
import {
  buildShareLinkSearch,
  inferShareLinkContextType,
} from "../lib/shareLink";
import { analytics } from "../lib/analytics";

type ShareLinkButtonProps = {
  readonly className?: string;
};

const COPIED_FEEDBACK_MS = 1800;

export const ShareLinkButton = ({ className }: ShareLinkButtonProps) => {
  const { t } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const simulationTime = useStore((s) => s.simulationTime);
  const timeScale = useStore((s) => s.timeScale);
  const gameMode = useStore((s) => s.gameMode);
  const activeMissionId = useStore((s) => s.activeMissionId);
  const navigationMode = useStore((s) => s.navigationMode);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleClick = useCallback(async () => {
    const input = {
      bodyId: activeBody,
      simulationTimeMs: simulationTime.getTime(),
      timeScale,
      gameMode,
      missionId: activeMissionId,
      navigationMode,
    };
    const search = buildShareLinkSearch(input);
    const url = `${window.location.origin}${window.location.pathname}${search}`;
    const contextType = inferShareLinkContextType(input);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      analytics.shareLinkCreated(contextType);
      setCopied(true);
    } catch {
      // Clipboard can fail in insecure contexts; still surface URL via prompt.
      window.prompt(t.phase3.shareLink.copyLabel, url);
      analytics.shareLinkCreated(contextType);
    }
  }, [
    activeBody,
    simulationTime,
    timeScale,
    gameMode,
    activeMissionId,
    navigationMode,
    t.phase3.shareLink.copyLabel,
  ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "pointer-events-auto rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/15 " +
        (className ?? "")
      }
    >
      {copied ? t.phase3.shareLink.copied : t.phase3.shareLink.copyLabel}
    </button>
  );
};
