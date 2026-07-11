import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';
import Logo from '../components/Logo';

const STATS = [
  { label: 'Quizzes', value: '∞' },
  { label: 'Rivalry', value: 'Live' },
  { label: 'Fun', value: '100%' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const go = (path: string) => {
    sound.play('whoosh');
    navigate(path);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '24px' }}>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '640px' }}>
        {/* Logo */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center', opacity: mounted ? 1 : 0, transform: mounted ? 'scale(1)' : 'scale(0.6)', transition: 'all 600ms var(--ease-spring)' }}>
          <div className="animate-float" style={{ animationDelay: '0.4s' }}>
            <Logo size={84} />
          </div>
        </div>

        {/* Badge */}
        <div
          className="chip chip-default"
          style={{ marginBottom: '20px', opacity: mounted ? 1 : 0, transition: 'opacity 600ms 200ms', padding: '6px 14px' }}
        >
          <span className="pulse-dot" /> Now live · Science edition
        </div>

        {/* Title */}
        <h1
          className="font-display text-gradient"
          style={{
            fontSize: 'clamp(2.8rem, 8vw, 4.5rem)',
            fontWeight: 800,
            marginBottom: '12px',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 700ms 250ms var(--ease-out-expo)',
          }}
        >
          QuizMaster
        </h1>

        <p
          className="text-secondary"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', maxWidth: '460px', margin: '0 auto 8px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 700ms 350ms var(--ease-out-expo)' }}
        >
          Challenge yourself. Climb the ranks. Master the science of curiosity.
        </p>

        {/* Stat strip */}
        <div
          style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '28px 0', flexWrap: 'wrap', opacity: mounted ? 1 : 0, transition: 'opacity 700ms 450ms' }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="glass" style={{ padding: '12px 22px', borderRadius: '14px', minWidth: '92px' }}>
              <div className="text-gradient font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 700ms 550ms var(--ease-out-expo)' }}>
          <button
            className="btn btn-primary btn-large"
            onClick={() => go(isAdmin ? '/admin' : '/start')}
            style={{ marginBottom: '20px', padding: '18px 52px', fontSize: '1.15rem' }}
          >
            {isAdmin ? 'Go to Dashboard' : 'Get Started'}
            <ArrowIcon />
          </button>
        </div>

        {/* Secondary actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', opacity: mounted ? 1 : 0, transition: 'opacity 700ms 650ms' }}>
          <button className="btn btn-secondary" onClick={() => go('/main')}>View Quizzes</button>
          <button className="btn btn-secondary" onClick={() => go('/main')}>Leaderboard</button>
        </div>

        {/* Admin link */}
        <div style={{ marginTop: '40px', opacity: mounted ? 1 : 0, transition: 'opacity 700ms 800ms' }}>
          <button className="btn btn-ghost btn-small" onClick={() => go('/login')}>
            <LockIcon /> Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
