import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAdmin } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background gradient overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(233, 69, 96, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        maxWidth: '600px',
        padding: '24px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            Q
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 50%, #e94560 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            QuizMaster
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.125rem', fontWeight: 400 }}>
            Challenge yourself. Climb the ranks.
          </p>
        </div>

        {/* Welcome Button */}
        <button
          className="btn btn-primary btn-large"
          onClick={() => navigate(isAdmin ? '/admin' : '/start')}
          style={{
            marginBottom: '24px',
            padding: '20px 48px',
            fontSize: '1.25rem',
          }}
        >
          {isAdmin ? 'Go to Dashboard' : 'Get Started'}
        </button>

        {/* Secondary Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/main')}>
            View Quizzes
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/main')}>
            Leaderboard
          </button>
        </div>

        {/* Admin Link */}
        <div style={{ marginTop: '48px' }}>
          <button className="btn btn-ghost btn-small" onClick={() => navigate('/login')}>
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
