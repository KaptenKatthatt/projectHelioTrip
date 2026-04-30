import { AchievementToast } from "../../AchievementToast";
import { XpToast } from "../../XpToast";
import { QuizOverlay } from "../../organisms/QuizOverlay";

export const HudOverlayRegion = () => (
  <>
    <AchievementToast />
    <XpToast />
    <QuizOverlay />
  </>
);
