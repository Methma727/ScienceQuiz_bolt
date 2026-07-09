import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../lib/constants';
import LoadingScreen from '../components/LoadingScreen';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && isAdmin) {
    navigate('/admin', { replace: true });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message);
      setLoading(false);
      return;
    }

    if (email === ADMIN_EMAIL) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/start', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '24px',
    }}>
      <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 700,
          }}>
            Q
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Sign In</h1>
          <p className="text-secondary">Access your account</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(233, 69, 96, 0.1)',
            border: '1px solid rgba(233, 69, 96, 0.3)',
            borderRadius: '12px',
            color: '#ff6b6b',
            marginBottom: '16px',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
              Email
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? <LoadingScreen message="" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            className="btn btn-ghost btn-small"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
