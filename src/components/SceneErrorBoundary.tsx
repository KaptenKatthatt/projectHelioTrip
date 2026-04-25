import { Component, type ErrorInfo, type ReactNode } from "react";

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
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Scene crashed during render", {
      feature: "scene_error_boundary",
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950/90 p-5 text-white shadow-2xl">
          <h2 className="text-lg font-semibold tracking-tight">
            Scene failed to load
          </h2>
          <p className="mt-2 text-sm text-white/80">
            HelioTrip kunde inte starta 3D-scenen just nu. Prova igen.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Retry Scene
          </button>
        </div>
      </div>
    );
  }
}
