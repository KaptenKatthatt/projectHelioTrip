import type { BodyId } from "../bodies";

type CuriosityHookTrigger =
  | { kind: "body_selected"; bodyId: BodyId }
  | { kind: "quiz_completed"; quizCount: number }
  | { kind: "daily_challenge"; missionTitle: string };

export type CuriosityHookTemplate = {
  readonly id: "mystery" | "streak" | "challenge";
  readonly sv: string;
  readonly en: string;
};

export const CURIOSITY_HOOK_TEMPLATES: readonly CuriosityHookTemplate[] = [
  {
    id: "mystery",
    sv: "Vill du veta vad som gör {body} extra speciell i vårt solsystem?",
    en: "Want to discover what makes {body} especially unique in our solar system?",
  },
  {
    id: "streak",
    sv: "Du har klarat {count} quiz - nästa kanske låser upp en ny favoritfakta.",
    en: "You've completed {count} quizzes - the next one might unlock a new favorite fact.",
  },
  {
    id: "challenge",
    sv: "Dagens utmaning är {mission}. Klarar du den innan nästa resa?",
    en: "Today's challenge is {mission}. Can you complete it before your next journey?",
  },
];

const getTemplate = (id: CuriosityHookTemplate["id"]): CuriosityHookTemplate => {
  const template = CURIOSITY_HOOK_TEMPLATES.find((item) => item.id === id);
  if (!template) {
    const fallback = CURIOSITY_HOOK_TEMPLATES[0];
    if (!fallback) {
      throw new Error("Curiosity hook templates are missing.");
    }
    return fallback;
  }
  return template;
};

export const resolveCuriosityHookMessage = (
  locale: "sv" | "en",
  trigger: CuriosityHookTrigger,
  bodyLabel?: string,
): string => {
  if (trigger.kind === "body_selected") {
    const template = getTemplate("mystery");
    return (locale === "sv" ? template.sv : template.en).replace(
      "{body}",
      bodyLabel ?? trigger.bodyId,
    );
  }
  if (trigger.kind === "quiz_completed") {
    const template = getTemplate("streak");
    return (locale === "sv" ? template.sv : template.en).replace(
      "{count}",
      String(trigger.quizCount),
    );
  }
  const template = getTemplate("challenge");
  return (locale === "sv" ? template.sv : template.en).replace(
    "{mission}",
    trigger.missionTitle,
  );
};
