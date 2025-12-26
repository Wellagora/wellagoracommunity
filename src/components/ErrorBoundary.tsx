import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We're working on fixing the problem. Please try again.
            </p>
            {this.state.error && (
              <details className="text-left text-sm bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-foreground">
                  Technical details
                </summary>
                <p className="mt-2 text-muted-foreground break-words">
                  {this.state.error.message}
                </p>
              </details>
            )}
            <Button onClick={this.handleReset} className="mt-4">
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
