import { AchievementToast } from "../../AchievementToast";
import { XpGainToast } from "../../XpGainToast";
import { QuizOverlay } from "../../organisms/QuizOverlay";

export const HudOverlayRegion = () => (
  <>
    <AchievementToast />
    <XpGainToast />
    <QuizOverlay />
  </>
);
