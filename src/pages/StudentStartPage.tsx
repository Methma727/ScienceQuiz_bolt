import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';

export default function StudentStartPage() {
  const navigate = useNavigate();
  const { studentName, setStudentName } = useApp();
  const [name, setName] = useState(studentName || '');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      sound.play('error');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      sound.play('error');
      return;
    }
    setStudentName(trimmedName);
    sound.play('whoosh');
    navigate('/quiz');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
      {/* Home button */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost btn-small"
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        Home
      </button>

      <div
        className="glass-elevated"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '36px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 600ms var(--ease-out-expo)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="animate-float" style={{ width: '60px', height: '60px', margin: '0 auto 14px', background: 'linear-gradient(135deg, var(--accent-success) 0%, #00b387 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,230,168,0.3)' }}>
            <BoltIcon />
          </div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Ready to Quiz?</h1>
          <p className="text-secondary">Enter your name to begin the challenge</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            Your Name
          </label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStart();
            }}
            placeholder="e.g. Ada Lovelace"
            autoFocus
            style={{ borderColor: error ? 'var(--accent-primary)' : undefined, boxShadow: error ? '0 0 0 4px var(--accent-soft)' : undefined }}
          />
          {error && (
            <p className="animate-fade-in" style={{ color: 'var(--accent-primary)', fontSize: '0.78rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DotIcon /> {error}
            </p>
          )}
        </div>

        <button className="btn btn-primary" onClick={handleStart} style={{ width: '100%', marginBottom: '12px', padding: '14px' }}>
          Start Quiz <ArrowIcon />
        </button>

        <button className="btn btn-ghost btn-small" onClick={() => navigate('/main')} style={{ width: '100%' }}>
          View Leaderboard
        </button>
      </div>
    </div>
  );
}

function BoltIcon() {
  return (<svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.4" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>);
}
function ArrowIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
}
function DotIcon() {
  return (<svg width="6" height="6" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor" /></svg>);
}
