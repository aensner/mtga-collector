import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully.
 * Prevents the entire app from crashing when a component throws an error.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // TODO: Send error to logging service in production
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-8">
          <div className="card max-w-lg w-full">
            <div className="card-header">
              <h2 className="text-xl font-bold text-error">Something went wrong</h2>
            </div>
            <div className="card-body space-y-4">
              <p className="text-fg-secondary">
                An unexpected error occurred. Please try refreshing the page.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-fg-muted hover:text-fg-secondary">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-bg-muted rounded text-sm font-mono overflow-auto max-h-48">
                    <p className="text-error font-bold">{this.state.error.name}</p>
                    <p className="text-fg-secondary mt-1">{this.state.error.message}</p>
                    {this.state.errorInfo && (
                      <pre className="text-fg-muted mt-2 text-xs whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
            <div className="card-actions">
              <button
                onClick={this.handleReset}
                className="button"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="button ghost"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
