import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Quiz, type BrowserInfo, type LocationInfo } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';
import LoadingScreen from '../components/LoadingScreen';
import Logo from '../components/Logo';

interface LeaderboardRow {
  id: string;
  student_name: string;
  score: number;
  quiz_id: string;
  created_at: string;
  ip_address: string | null;
  browser_info: BrowserInfo | null;
  location: LocationInfo | null;
  quizzes: { title: string } | { title: string }[] | null;
}

export default function MainPage() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<LeaderboardRow | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchLeaderboard(selectedQuizId);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    if (allQuizzes.length > 0 && selectedQuizId === '') {
      const activeQuiz = allQuizzes.find((q) => q.is_active);
      if (activeQuiz) {
        setSelectedQuizId(activeQuiz.id);
      } else if (allQuizzes.length > 0) {
        setSelectedQuizId(allQuizzes[0].id);
      }
    }
  }, [allQuizzes, selectedQuizId]);

  const fetchData = async () => {
    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    setAllQuizzes(quizzesData || []);

    const now = new Date();
    const active = quizzesData?.filter((q) => {
      if (!q.is_active) return false;
      if (q.starts_at && new Date(q.starts_at) > now) return false;
      if (q.ends_at && new Date(q.ends_at) < now) return false;
      return true;
    }) || [];
    setActiveQuizzes(active);

    setLoading(false);
  };

  const fetchLeaderboard = async (quizId: string) => {
    let query = supabase
      .from('leaderboard')
      .select('id, student_name, score, quiz_id, created_at, ip_address, browser_info, location, quizzes(title)')
      .order('score', { ascending: false });

    if (quizId !== 'all') {
      query = query.eq('quiz_id', quizId);
    }

    const { data } = await query;
    setLeaderboard((data as LeaderboardRow[]) || []);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo size={34} />
            <span className="navbar-title">QuizMaster</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-ghost btn-small" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HomeIcon /> Home
            </button>
            {isAdmin && (
              <button className="btn btn-ghost btn-small" onClick={handleSignOut}>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button className={`tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => setTabValue(0)}>
            <BookIcon /> Quizzes
          </button>
          <button className={`tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => setTabValue(1)}>
            <TrophyIcon /> Leaderboard
          </button>
        </div>

        {/* Quizzes Tab */}
        {tabValue === 0 && (
          <>
            {activeQuizzes.length === 0 ? (
              <div className="glass animate-fade-in" style={{ padding: '56px 32px', textAlign: 'center' }}>
                <div className="animate-float" style={{ fontSize: '52px', marginBottom: '16px', opacity: 0.5 }}>🛰️</div>
                <p className="text-secondary" style={{ fontSize: '1.05rem' }}>No active quizzes available</p>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                  Check back later for new challenges
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {activeQuizzes.map((quiz, i) => (
                  <div
                    key={quiz.id}
                    className="glass glass-interactive animate-fade-in"
                    style={{ padding: '24px', animationDelay: `${i * 0.06}s` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '50px', height: '50px', background: 'var(--accent-gradient)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px var(--accent-soft)' }}>
                        <BookIcon size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 className="font-display" style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1.1rem' }}>{quiz.title}</h4>
                        <span className="chip chip-success"><span className="pulse-dot" /> Active</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => { sound.play('whoosh'); navigate('/start'); }}
                      style={{ width: '100%' }}
                    >
                      Start Quiz <ArrowIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Leaderboard Tab */}
        {tabValue === 1 && (
          <>
            <div className="glass animate-fade-in" style={{ padding: '16px', marginBottom: '24px' }}>
              <select
                className="select"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
              >
                <option value="all">All Quizzes</option>
                {allQuizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} {quiz.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {leaderboard.length === 0 ? (
              <div className="glass animate-fade-in" style={{ padding: '56px 32px', textAlign: 'center' }}>
                <div className="animate-float" style={{ fontSize: '52px', marginBottom: '16px' }}>🏆</div>
                <p className="text-secondary" style={{ fontSize: '1.05rem' }}>No scores yet</p>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px', marginBottom: '24px' }}>
                  Be the first to complete the quiz!
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/start')}>Take Quiz</button>
              </div>
            ) : (
              <div className="table-container glass animate-fade-in">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                      <th>Student</th>
                      <th style={{ textAlign: 'center' }}>Score</th>
                      {selectedQuizId === 'all' && <th>Quiz</th>}
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <tr
                          key={entry.id}
                          className={`animate-fade-in ${isAdmin ? 'leaderboard-row' : ''}`}
                          style={{ animationDelay: `${index * 0.04}s` }}
                          onClick={() => isAdmin && setSelectedParticipant(entry)}
                          role={isAdmin ? 'button' : undefined}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <span className={`rank-badge ${getRankClass(rank)}`}>{rank}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {entry.student_name}
                            {isAdmin && entry.location && (
                              <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '6px' }}>
                                {entry.location.city}{entry.location.country ? `, ${entry.location.country}` : ''}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`chip ${rank <= 3 ? 'chip-primary' : 'chip-default'}`}>{entry.score}</span>
                          </td>
                          {selectedQuizId === 'all' && (
                            <td className="text-secondary">
                              {(Array.isArray(entry.quizzes) ? entry.quizzes[0]?.title : entry.quizzes?.title) || 'Unknown'}
                            </td>
                          )}
                          <td className="text-muted">{formatDate(entry.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Participant Detail Modal (admin only) */}
      {isAdmin && selectedParticipant && (
        <div className="modal-overlay" onClick={() => setSelectedParticipant(null)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Participant Details</h3>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Identity */}
              <div className="participant-section">
                <div className="participant-section-title">Identity</div>
                <div className="participant-field">
                  <span className="participant-label">Name</span>
                  <span className="participant-value">{selectedParticipant.student_name}</span>
                </div>
                <div className="participant-field">
                  <span className="participant-label">Score</span>
                  <span className="participant-value">{selectedParticipant.score}</span>
                </div>
                <div className="participant-field">
                  <span className="participant-label">Submitted</span>
                  <span className="participant-value">
                    {new Date(selectedParticipant.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Location */}
              {selectedParticipant.location && (
                <div className="participant-section">
                  <div className="participant-section-title">Location</div>
                  <div className="participant-field">
                    <span className="participant-label">IP Address</span>
                    <span className="participant-value font-mono">{selectedParticipant.location.ip}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">City</span>
                    <span className="participant-value">{selectedParticipant.location.city}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Region</span>
                    <span className="participant-value">{selectedParticipant.location.region}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Country</span>
                    <span className="participant-value">{selectedParticipant.location.country}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Timezone</span>
                    <span className="participant-value">{selectedParticipant.location.timezone}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">ISP</span>
                    <span className="participant-value">{selectedParticipant.location.isp}</span>
                  </div>
                </div>
              )}

              {/* Browser Info */}
              {selectedParticipant.browser_info && (
                <div className="participant-section">
                  <div className="participant-section-title">Device & Browser</div>
                  <div className="participant-field">
                    <span className="participant-label">Browser</span>
                    <span className="participant-value">{selectedParticipant.browser_info.browser}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">OS</span>
                    <span className="participant-value">{selectedParticipant.browser_info.os}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Device</span>
                    <span className="participant-value">{selectedParticipant.browser_info.device}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Screen</span>
                    <span className="participant-value">{selectedParticipant.browser_info.screen}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Language</span>
                    <span className="participant-value">{selectedParticipant.browser_info.language}</span>
                  </div>
                  <div className="participant-field">
                    <span className="participant-label">Platform</span>
                    <span className="participant-value font-mono" style={{ fontSize: '0.8rem' }}>
                      {selectedParticipant.browser_info.platform}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedParticipant(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookIcon({ size = 18 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>);
}
function TrophyIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>);
}
function ArrowIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
}
function HomeIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
}
