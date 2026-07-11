import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../lib/constants';
import { sound } from '../lib/sound';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Redirect in an effect rather than during render — calling navigate()
  // directly in the render body is a React anti-pattern that throws warnings.
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Invalid email or password' : error.message);
      sound.play('error');
      setLoading(false);
      return;
    }

    sound.play('success');
    if (email === ADMIN_EMAIL) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/start', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <Logo size={56} />
          </div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Welcome Back</h1>
          <p className="text-secondary">Sign in to access your account</p>
        </div>

        {error && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(233, 69, 96, 0.1)',
              border: '1px solid rgba(233, 69, 96, 0.3)',
              borderRadius: '12px',
              color: '#ff7eb3',
              marginBottom: '16px',
              fontSize: '0.875rem',
            }}
          >
            <WarnIcon /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <MailIcon />
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                style={{ paddingLeft: '44px' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyIcon />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button className="btn btn-ghost btn-small" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/* Inline icons keep the bundle tiny (no extra deps). */
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );
}
function EyeIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>);
}
function EyeOffIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a13 13 0 0 1-1.67 2.68M6.61 6.61A13 13 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.39-1.61M14.12 14.12a3 3 0 1 1-4.24-4.24M2 2l20 20" /></svg>);
}
function WarnIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>);
}
