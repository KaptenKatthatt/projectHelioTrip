import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, CircleHelp } from 'lucide-react';

type CollapsibleHudPanelProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly collapsedTitlePrefix?: ReactNode;
  readonly collapsedTitleClassName?: string;
  readonly className?: string;
  readonly defaultCollapsed?: boolean;
  readonly collapseLabel: string;
  readonly expandLabel: string;
  readonly collapsedIcon?: 'chevron' | 'help';
  readonly collapseOnExpandedHeaderClick?: boolean;
  readonly showExpandedToggle?: boolean;
};

const ToggleIcon = ({
  expanded,
  collapsedIcon = 'chevron',
}: {
  readonly expanded: boolean;
  readonly collapsedIcon?: 'chevron' | 'help';
}) => {
  const CollapsedGlyph = collapsedIcon === 'help' ? CircleHelp : ChevronUp;
  const ExpandedGlyph = collapsedIcon === 'help' ? ChevronUp : ChevronDown;
  return (
    <span className="relative h-4 w-4">
      <CollapsedGlyph
        className={
          'absolute inset-0 h-4 w-4 transition-all duration-200 ease-out ' +
          (expanded ? 'scale-75 opacity-0' : 'scale-100 opacity-100')
        }
      />
      <ExpandedGlyph
        className={
          'absolute inset-0 h-4 w-4 transition-all duration-200 ease-out ' +
          (expanded ? 'scale-100 opacity-100' : 'scale-75 opacity-0')
        }
      />
    </span>
  );
};

export const CollapsibleHudPanel = ({
  title,
  children,
  collapsedTitlePrefix,
  collapsedTitleClassName,
  className,
  defaultCollapsed = false,
  collapseLabel,
  expandLabel,
  collapsedIcon = 'chevron',
  collapseOnExpandedHeaderClick = false,
  showExpandedToggle = true,
}: CollapsibleHudPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const rootClassName = className ?? 'relative';
  const collapsedPanelClassName =
    'pointer-events-auto rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md';

  return (
    <div className={rootClassName}>
      <div
        className={
          'overflow-hidden transition-[max-height,opacity] duration-200 ease-out ' +
          (isCollapsed ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0')
        }
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          aria-expanded="false"
          aria-label={`${expandLabel}: ${title}`}
          className={`${collapsedPanelClassName} flex w-full items-center justify-between gap-3 text-left`}
        >
          <span className="flex min-w-0 items-center gap-2 px-1">
            {collapsedTitlePrefix}
            <span
              className={
                collapsedTitleClassName ??
                'truncate text-sm font-medium text-white/85'
              }
            >
              {title}
            </span>
          </span>
          {collapsedIcon === 'help' ? (
            <span className="pointer-events-none inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80">
              <ToggleIcon expanded={false} collapsedIcon={collapsedIcon} />
            </span>
          ) : null}
        </button>
      </div>

      <div
        className={
          'relative overflow-hidden transition-[max-height,opacity] duration-200 ease-out ' +
          (isCollapsed ? 'pointer-events-none max-h-0 opacity-0' : 'max-h-[80vh] opacity-100')
        }
      >
        {collapseOnExpandedHeaderClick ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label={`${collapseLabel}: ${title}`}
            className="pointer-events-auto absolute top-0 left-0 right-11 z-10 h-14 rounded-t-2xl"
          />
        ) : null}
        {showExpandedToggle ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-expanded="true"
            aria-label={`${collapseLabel}: ${title}`}
            className="pointer-events-auto absolute top-2 right-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/55 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
          >
            <ToggleIcon expanded collapsedIcon={collapsedIcon} />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
};
