import { useState, type ReactNode } from 'react';
import { HudPanelToggleButton } from "./HudPanelToggleButton";

type CollapsibleHudPanelRenderContext = {
  readonly expandedCloseToggle: ReactNode;
};

type CollapsibleHudPanelProps = {
  readonly title: string;
  readonly children:
    | ReactNode
    | ((ctx: CollapsibleHudPanelRenderContext) => ReactNode);
  readonly collapsedTitlePrefix?: ReactNode;
  readonly collapsedTitleClassName?: string;
  readonly className?: string;
  readonly defaultCollapsed?: boolean;
  readonly collapseLabel: string;
  readonly expandLabel: string;
  readonly collapseOnExpandedHeaderClick?: boolean;
  readonly showExpandedToggle?: boolean;
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
  collapseOnExpandedHeaderClick = false,
  showExpandedToggle = true,
}: CollapsibleHudPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const rootClassName = className ?? 'relative';
  const collapsedPanelClassName = 'pointer-events-auto ds-panel-tight';

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
          <HudPanelToggleButton
            asSpan
            expanded={false}
            className="pointer-events-none"
          />
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
        {typeof children === 'function' ? (
          children({
            expandedCloseToggle: showExpandedToggle ? (
              <HudPanelToggleButton
                onClick={() => setIsCollapsed(true)}
                label={`${collapseLabel}: ${title}`}
                className="pointer-events-auto z-20"
                expanded
              />
            ) : null,
          })
        ) : (
          <>
            {showExpandedToggle ? (
              <HudPanelToggleButton
                onClick={() => setIsCollapsed(true)}
                label={`${collapseLabel}: ${title}`}
                className="pointer-events-auto absolute top-2 right-2 z-20"
                expanded
              />
            ) : null}
            {children}
          </>
        )}
      </div>
    </div>
  );
};
