import { buildShareLinkSearch, parseShareLink } from "./shareLinkCodec";
import type {
  ShareLinkContextType,
  ShareLinkInput,
  ShareLinkState,
} from "./shareLinkTypes";

export { buildShareLinkSearch, parseShareLink };
export type { ShareLinkContextType, ShareLinkState };

export const inferShareLinkContextType = (
  state: ShareLinkInput,
): ShareLinkContextType => {
  if (state.missionId !== null) return "mission";
  if (state.bodyId !== null) return "body";
  if (state.gameMode !== "explore") return "mode";
  return "overview";
};
