type HudTopBarRegionProps = {
  readonly mobileLayout: boolean;
  readonly appTitle: string;
  readonly tagline: string;
};

export const HudTopBarRegion = ({
  mobileLayout,
  appTitle,
  tagline,
}: HudTopBarRegionProps) => (
  <header
    className={
      mobileLayout
        ? "flex flex-col gap-3"
        : "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    }
  >
    <div className="pointer-events-auto">
      <h1
        className={
          mobileLayout
            ? "text-base font-semibold tracking-tight"
            : "text-base font-semibold tracking-tight sm:text-lg"
        }
      >
        {appTitle}
      </h1>
      <p className={mobileLayout ? "hidden" : "text-xs text-white/50"}>{tagline}</p>
    </div>
  </header>
);
