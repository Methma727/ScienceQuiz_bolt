import Logo from './Logo';

interface LoadingScreenProps {
  message?: string;
}

/** Centered branded loader with an animated brand mark. */
export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: '20px',
    }}>
      <div className="animate-float">
        <Logo size={56} />
      </div>
      <div className="spinner" />
      <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
}
