import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-slate-500 font-medium mb-8">
              We encountered an unexpected error while rendering this component.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <RotateCcw size={18} />
                Reload Application
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
              >
                <Home size={18} />
                Back to Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-rose-600 break-all">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
