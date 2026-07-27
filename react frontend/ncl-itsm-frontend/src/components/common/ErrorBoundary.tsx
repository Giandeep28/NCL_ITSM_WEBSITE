import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    console.error('Uncaught Error in React Component Tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-100 p-6">
          <div className="max-w-md w-full bg-[#1E293B] border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400 text-2xl font-bold">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">Application Rendering Error</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected error occurred while rendering this interface. Our system isolated the fault to preserve application stability.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-left overflow-x-auto">
                <p className="text-[11px] font-mono text-rose-400 break-all m-0">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
