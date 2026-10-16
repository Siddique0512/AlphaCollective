import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ALPHA COLLECTIV3] Uncaught application error caught by boundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F3] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#141416] border border-[#222226] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-xl bg-[#D71920]/15 border border-[#D71920]/30 text-[#EF4444] flex items-center justify-center mx-auto text-xl font-mono font-bold">
              !
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-white">
              ALPHA COLLECTIV3
            </h2>
            <p className="text-xs sm:text-sm text-[#888885] leading-relaxed">
              A temporary render glitch occurred while syncing live feeds. Your session is safe.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-2 w-full py-3 px-6 rounded-xl bg-[#D71920] hover:bg-[#B9151B] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              RELOAD WEBSITE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
