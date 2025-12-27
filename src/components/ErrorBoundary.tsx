import React, { Component, ErrorInfo, ReactNode, lazy, Suspense } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ErrorPage = lazy(() => import("@/pages/ErrorPage"));

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
    // Log error but avoid console.log in production
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      // Fallback UI in case ErrorPage fails to load
      return (
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#0A1930] p-4">
              <div className="max-w-md w-full text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground">
                  We're working on fixing the problem. Please try again.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={this.handleReset} 
                    variant="outline"
                    className="border-[hsl(var(--cyan))]/30"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                  <Button 
                    onClick={this.handleGoHome}
                    className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))]"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go home
                  </Button>
                </div>
              </div>
            </div>
          }
        >
          <ErrorPage error={this.state.error} resetError={this.handleReset} />
        </Suspense>
      );
    }

    return this.props.children;
  }
}
