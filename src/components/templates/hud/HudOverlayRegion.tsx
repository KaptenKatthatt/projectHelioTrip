import { AchievementToast } from "../../AchievementToast";
import { DrAstraPromptToast } from "../../DrAstraPromptToast";
import { PlanetPatienceRewardToast } from "../../PlanetPatienceRewardToast";
import { XpGainToast } from "../../XpGainToast";
import { QuizOverlay } from "../../organisms/QuizOverlay";

export const HudOverlayRegion = () => (
  <>
    <AchievementToast />
    <XpGainToast />
    <PlanetPatienceRewardToast />
    <DrAstraPromptToast />
    <QuizOverlay />
  </>
);
