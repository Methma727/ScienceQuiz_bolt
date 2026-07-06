import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Chip } from '@heroui/react';
import { supabase, type Quiz } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Trophy, NotebookText, LogOut } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

interface LeaderboardRow {
  id: string;
  student_name: string;
  score: number;
  quiz_id: string;
  created_at: string;
  quizzes: { title: string } | { title: string }[] | null;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useApp();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });
      setQuizzes(quizzesData || []);

      let query = supabase
        .from('leaderboard')
        .select('id, student_name, score, quiz_id, created_at, quizzes(title)')
        .order('score', { ascending: false });

      if (selectedQuizId !== 'all') {
        query = query.eq('quiz_id', selectedQuizId);
      }

      const { data: leaderboardData } = await query;
      setLeaderboard((leaderboardData as LeaderboardRow[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [selectedQuizId]);

  useEffect(() => {
    if (quizzes.length > 0 && selectedQuizId === 'all') {
      const activeQuiz = quizzes.find((q) => q.is_active);
      if (activeQuiz) {
        setSelectedQuizId(activeQuiz.id);
      }
    }
  }, [quizzes, selectedQuizId]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400 text-black';
      case 2: return 'bg-gray-300 text-black';
      case 3: return 'bg-amber-700 text-white';
      default: return 'bg-[#2a2a3e] text-[#eaeaea]';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading leaderboard..." />;
  }

  return (
    <div className="min-h-screen bg-bg-default">
      <header className="flex items-center px-4 py-3 border-b border-[#2a2a3e] bg-[#0f0f23]">
        <Trophy className="mr-2" size={24} color="#e94560" />
        <h1 className="flex-1 text-lg font-semibold text-white">Leaderboard</h1>
        {isAdmin ? (
          <Button variant="ghost" size="sm" onPress={signOut} startContent={<LogOut size={16} />}>
            Sign Out
          </Button>
        ) : (
          <Button variant="solid" size="sm" onPress={() => navigate('/start')} startContent={<NotebookText size={16} />}>
            Take Quiz
          </Button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <Card className="mb-4">
          <CardContent className="p-3">
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#2a2a3e] bg-[#14141f] text-[#eaeaea] text-sm focus:outline-none focus:border-[#e94560]"
            >
              <option value="all">All Quizzes</option>
              {quizzes.map((quiz) => (
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
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankColor(rank)}`}>
                          {rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{entry.student_name}</td>
                      <td className="px-4 py-3 text-center">
                        <Chip size="sm" color={rank <= 3 ? 'secondary' : 'default'}>{entry.score}</Chip>
                      </td>
                      {selectedQuizId === 'all' && (
                        <td className="px-4 py-3 text-sm text-white">
                          {(Array.isArray(entry.quizzes) ? entry.quizzes[0]?.title : entry.quizzes?.title) || 'Unknown'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-white">{formatDate(entry.created_at)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
