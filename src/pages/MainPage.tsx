import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Quiz } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import LoadingScreen from '../components/LoadingScreen';

interface LeaderboardRow {
  id: string;
  student_name: string;
  score: number;
  quiz_id: string;
  created_at: string;
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
      .select('id, student_name, score, quiz_id, created_at, quizzes(title)')
      .order('score', { ascending: false });

    if (quizId !== 'all') {
      query = query.eq('quiz_id', quizId);
    }

    const { data } = await query;
    setLeaderboard(data as LeaderboardRow[] || []);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

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
          <span className="navbar-title">QuizMaster</span>
          {isAdmin ? (
            <button className="btn btn-ghost btn-small" onClick={handleSignOut}>
              Sign Out
            </button>
          ) : null}
        </div>
      </nav>

      <div className="container">
        {/* Tabs */}
        <div className="tabs mb-3" style={{ marginBottom: '24px' }}>
          <button
            className={`tab ${tabValue === 0 ? 'active' : ''}`}
            onClick={() => setTabValue(0)}
          >
            Quizzes
          </button>
          <button
            className={`tab ${tabValue === 1 ? 'active' : ''}`}
            onClick={() => setTabValue(1)}
          >
            Leaderboard
          </button>
        </div>

        {/* Quizzes Tab */}
        {tabValue === 0 && (
          <>
            {activeQuizzes.length === 0 ? (
              <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>?</div>
                <p className="text-secondary">No active quizzes available</p>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                  Check back later for new challenges
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {activeQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="glass"
                    style={{
                      padding: '24px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}>
                        Q
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{quiz.title}</h4>
                        <span className="chip chip-success">Active</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/start')}
                      style={{ width: '100%' }}
                    >
                      Start Quiz
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
            {/* Filter */}
            <div className="glass mb-3" style={{ padding: '16px', marginBottom: '24px' }}>
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
              <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                <p className="text-secondary">No scores yet</p>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px', marginBottom: '24px' }}>
                  Be the first to complete the quiz!
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/start')}>
                  Take Quiz
                </button>
              </div>
            ) : (
              <div className="table-container glass">
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
                        <tr key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`rank-badge ${getRankClass(rank)}`}>
                              {rank}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{entry.student_name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`chip ${rank <= 3 ? 'chip-primary' : 'chip-default'}`}>
                              {entry.score}
                            </span>
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

      {/* Floating Home Button */}
      <button className="fab" onClick={() => navigate('/')} title="Home">
        ⌂
      </button>
    </div>
  );
}
