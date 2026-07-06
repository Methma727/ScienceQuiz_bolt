import { Spinner } from '@heroui/react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-default gap-4">
      <Spinner size="lg" />
      <p className="text-text-secondary text-base">{message}</p>
    </div>
  );
}
