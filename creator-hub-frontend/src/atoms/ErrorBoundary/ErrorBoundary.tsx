// Modules
import React from "react";
// Organism
import { ErrorFallback } from "@/organism/ErrorFallback";

type TErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Class component because React has no hook equivalent for catching render
 * errors thrown by children. Wraps the router so a crash in any single page
 * falls back to a generic screen instead of a blank app.
 */
class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  TErrorBoundaryState
> {
  state: TErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("Unhandled error in the component tree", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
