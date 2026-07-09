import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StudentStartPage() {
  const navigate = useNavigate();
  const { studentName, setStudentName } = useApp();
  const [name, setName] = useState(studentName || '');
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setStudentName(trimmedName);
    navigate('/quiz');
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
            background: 'linear-gradient(135deg, #00d9a5 0%, #00b387 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            ?
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Ready to Quiz?</h1>
          <p className="text-secondary">Enter your name to begin</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
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
            placeholder="Enter your name"
            style={{
              borderColor: error ? '#e94560' : undefined,
            }}
          />
          {error && (
            <p style={{ color: '#e94560', fontSize: '0.75rem', marginTop: '6px' }}>{error}</p>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleStart}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          Start Quiz
        </button>

        <button
          className="btn btn-ghost btn-small"
          onClick={() => navigate('/main')}
          style={{ width: '100%' }}
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
