import type { FactCard as FactCardData } from "../../lib/learning/bodyContent";
import type { Locale } from "../../i18n/translations";

type Props = {
  readonly card: FactCardData;
  readonly locale: Locale;
};

export const FactCard = ({ card, locale }: Props) => {
  const title = card.title[locale];
  const body = card.body[locale];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none" aria-hidden="true">
          {card.icon}
        </span>
        <h3 className="text-sm font-semibold text-white leading-tight">{title}</h3>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{body}</p>
    </div>
  );
};
