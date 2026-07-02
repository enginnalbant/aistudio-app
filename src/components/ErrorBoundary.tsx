import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-mono">
          <h1 className="text-2xl text-red-500 mb-4 font-bold">APEXOS - KRİTİK HATA</h1>
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-2xl w-full">
            <p className="text-red-400 mb-4">Uygulama yüklenirken bir hata oluştu. Lütfen konsol loglarını kontrol edin veya sayfayı yenileyin.</p>
            <pre className="text-xs text-zinc-500 overflow-auto p-4 bg-black/50 rounded-lg">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-red-500 text-black font-bold rounded-lg hover:bg-red-400 transition-colors"
            >
              Yeniden Başlat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
