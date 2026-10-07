import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={className} style={{ animation: 'spin 1s linear infinite' }} />;
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={32} className="text-blue-600" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size={24} className="text-blue-600" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
