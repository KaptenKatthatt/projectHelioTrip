import { AchievementToast } from "../../AchievementToast";
import { DrAstraPromptToast } from "../../DrAstraPromptToast";
import { XpGainToast } from "../../XpGainToast";
import { QuizOverlay } from "../../organisms/QuizOverlay";

export const HudOverlayRegion = () => (
  <>
    <AchievementToast />
    <XpGainToast />
    <DrAstraPromptToast />
    <QuizOverlay />
  </>
);
