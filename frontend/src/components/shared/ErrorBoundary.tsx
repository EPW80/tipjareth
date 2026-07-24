import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches render-time failures in Web3 features so one broken widget can't take down the page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Something went wrong loading this section. Refresh the page to try again.
        </div>
      );
    }
    return this.props.children;
  }
}
