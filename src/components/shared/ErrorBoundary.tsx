import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Unhandled React render error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background text-foreground">
          <div className="glass rounded-2xl p-8 max-w-md text-center border border-border space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-xs text-muted-foreground">
              The application encountered a display error. Click below to recover and return to the dashboard.
            </p>

            {this.state.error && (
              <div className="p-3 bg-secondary/50 rounded-lg text-[11px] font-mono text-muted-foreground truncate border border-border">
                {this.state.error.message}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" onClick={this.handleReset} className="gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Recover & Reload
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/dashboard'} className="gap-2 text-xs">
                <Home className="w-3.5 h-3.5" /> Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
