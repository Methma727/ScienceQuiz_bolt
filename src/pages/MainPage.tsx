import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, CardFooter, Chip, Tabs, Tab } from '@heroui/react';
import { supabase, type Quiz } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { NotebookText, Trophy, LogOut, Play, Home } from 'lucide-react';
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
  const [tabValue, setTabValue] = useState('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
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
    if (allQuizzes.length > 0 && selectedQuizId === 'all') {
      const activeQuiz = allQuizzes.find((q) => q.is_active);
      if (activeQuiz) {
        setSelectedQuizId(activeQuiz.id);
      }
    }
  }, [allQuizzes, selectedQuizId]);

  const fetchData = async () => {
    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    setAllQuizzes(quizzesData || []);

    const activeQuizzes = quizzesData?.filter((q) => q.is_active) || [];
    setQuizzes(activeQuizzes);

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

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400 text-black';
      case 2: return 'bg-gray-300 text-black';
      case 3: return 'bg-amber-700 text-white';
      default: return 'bg-[#2a2a3e] text-[#eaeaea]';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-bg-default">
      <header className="flex items-center px-4 py-3 border-b border-[#2a2a3e]" style={{ backgroundColor: '#0f0f23' }}>
        <h1 className="flex-1 text-lg font-semibold text-white">QuizMaster</h1>
        {isAdmin && (
          <Button variant="ghost" size="sm" onPress={handleSignOut} startContent={<LogOut size={16} />}>
            Sign Out
          </Button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs selectedKey={tabValue} onSelectionChange={(key) => setTabValue(key as string)}>
          <Tab id="quizzes" title="Quizzes" />
          <Tab id="leaderboard" title="Leaderboard" />
        </Tabs>

        {tabValue === 'quizzes' && (
          <div className="mt-4">
            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <NotebookText className="mx-auto mb-3" size={64} style={{ color: '#a0a0a0' }} />
                  <p className="text-lg text-text-secondary">No active quizzes</p>
                  <p className="text-sm text-text-secondary mt-2">Check back later for new challenges</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-hover"
                  >
                    <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                          <NotebookText size={40} style={{ color: '#e94560' }} />
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{quiz.title}</h4>
                            <Chip size="sm" color="success" className="mt-1">Active</Chip>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0">
                        <Button
                          variant="solid"
                          size="lg"
                          fullWidth
                          onPress={() => navigate('/start')}
                          startContent={<Play size={20} />}
                          className="py-4"
                          style={{
                            background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
                            color: 'white',
                            border: 'none',
                          }}
                        >
                          Start Quiz
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabValue === 'leaderboard' && (
          <div className="mt-4">
            <Card className="mb-4">
              <CardContent className="p-3">
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#2a2a3e] bg-[#14141f] text-[#eaeaea] text-sm focus:outline-none focus:border-[#e94560]"
                >
                  <option value="all">All Quizzes</option>
                  {allQuizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title} {quiz.is_active ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {leaderboard.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="mx-auto mb-3" size={64} style={{ color: '#a0a0a0' }} />
                  <p className="text-lg text-text-secondary">No scores yet</p>
                  <p className="text-sm text-text-secondary mt-2 mb-4">Be the first to complete the quiz!</p>
                  <Button onPress={() => navigate('/start')}>Take Quiz</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border border-[#2a2a3e] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#14141f' }}>
                      <th className="px-4 py-3 text-center font-semibold text-sm w-[80px]">Rank</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Student</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm">Score</th>
                      {selectedQuizId === 'all' && (
                        <th className="px-4 py-3 text-left font-semibold text-sm">Quiz</th>
                      )}
                      <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-[#2a2a3e] hover:bg-[rgba(233,69,96,0.04)]"
                        >
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold ${getRankColor(rank)}`}>
                              {rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-white">{entry.student_name}</td>
                          <td className="px-4 py-3 text-center">
                            <Chip size="sm" color={rank <= 3 ? 'secondary' : 'default'}>{entry.score}</Chip>
                          </td>
                          {selectedQuizId === 'all' && (
                            <td className="px-4 py-3 text-sm" style={{ color: '#eaeaea' }}>
                              {(Array.isArray(entry.quizzes) ? entry.quizzes[0]?.title : entry.quizzes?.title) || 'Unknown'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm" style={{ color: '#eaeaea' }}>{formatDate(entry.created_at)}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <Button
          isIconOnly
          onPress={() => navigate('/')}
          className="rounded-full shadow-lg"
          style={{
            backgroundColor: '#e94560',
            color: 'white',
            boxShadow: '0 4px 20px rgba(233, 69, 96, 0.4)',
          }}
        >
          <Home size={24} />
        </Button>
      </div>
    </div>
  );
}
