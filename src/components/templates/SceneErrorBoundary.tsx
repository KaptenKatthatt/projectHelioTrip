import React, { Component, createRef, type ReactNode } from "react";

type SceneErrorBoundaryProps = {
  children: ReactNode;
  onRetry: () => void;
};

type SceneErrorBoundaryState = {
  hasError: boolean;
};

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  override state: SceneErrorBoundaryState = { hasError: false };
  private readonly dialogRef = createRef<HTMLDivElement>();
  private readonly retryButtonRef = createRef<HTMLButtonElement>();
  private previousFocusedElement: HTMLElement | null = null;
  private readonly headingId = "scene-error-boundary-title";

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidMount(): void {
    if (this.state.hasError) {
      this.captureFocus();
      this.focusDialog();
    }
  }

  override componentDidUpdate(
    _prevProps: SceneErrorBoundaryProps,
    prevState: SceneErrorBoundaryState,
  ): void {
    if (!prevState.hasError && this.state.hasError) {
      this.captureFocus();
      this.focusDialog();
      return;
    }

    if (prevState.hasError && !this.state.hasError) {
      this.restoreFocus();
    }
  }

  override componentWillUnmount(): void {
    this.restoreFocus();
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Scene crashed during render", {
      feature: "scene_error_boundary",
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private readonly captureFocus = (): void => {
    const active = document.activeElement;
    this.previousFocusedElement = active instanceof HTMLElement ? active : null;
  };

  private readonly focusDialog = (): void => {
    this.retryButtonRef.current?.focus();
    if (document.activeElement !== this.retryButtonRef.current) {
      this.dialogRef.current?.focus();
    }
  };

  private readonly restoreFocus = (): void => {
    this.previousFocusedElement?.focus();
    this.previousFocusedElement = null;
  };

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div
          ref={this.dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={this.headingId}
          tabIndex={-1}
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950/90 p-5 text-white shadow-2xl"
        >
          <h2
            id={this.headingId}
            className="text-lg font-semibold tracking-tight"
          >
            Scenen kunde inte laddas
          </h2>
          <p className="mt-2 text-sm text-white/80">
            HelioTrip kunde inte starta 3D-scenen just nu. Försök igen.
          </p>
          <button
            ref={this.retryButtonRef}
            type="button"
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }
}
