import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info?.componentStack);
  }

  // Navigating to another page clears the error
  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="max-w-xl mx-auto px-margin-sm py-space-xl text-center">
        <span className="font-code-sm text-code-sm text-on-surface-variant">UNEXPECTED ERROR</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mt-space-xs">Something went wrong</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
          This page failed to load. Reloading usually fixes it. If it keeps happening, try again in a minute.
        </p>
        <button
          type="button" onClick={() => window.location.reload()}
          className="mt-space-md bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2.5 border border-primary hover:bg-primary-container"
        >
          Reload page
        </button>
      </div>
    );
  }
}