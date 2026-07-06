import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, type Quiz } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import LogoutIcon from '@mui/icons-material/Logout';
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
      case 1:
        return { bgcolor: '#ffd700', color: '#000' };
      case 2:
        return { bgcolor: '#c0c0c0', color: '#000' };
      case 3:
        return { bgcolor: '#cd7f32', color: '#fff' };
      default:
        return { bgcolor: 'grey.200', color: 'text.primary' };
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Leaderboard
          </Typography>
          {isAdmin ? (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={signOut}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              color="primary"
              startIcon={<QuizIcon />}
              onClick={() => navigate('/start')}
            >
              Take Quiz
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="quiz-filter-label">Filter by Quiz</InputLabel>
              <Select
                labelId="quiz-filter-label"
                value={selectedQuizId}
                label="Filter by Quiz"
                onChange={(e) => setSelectedQuizId(e.target.value)}
              >
                <MenuItem value="all">All Quizzes</MenuItem>
                {quizzes.map((quiz) => (
                  <MenuItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                    {quiz.is_active && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {leaderboard.length === 0 ? (
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No scores yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Be the first to complete the quiz!
              </Typography>
              <Button variant="contained" onClick={() => navigate('/start')}>
                Take Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 80, fontWeight: 600 }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Score
                  </TableCell>
                  {selectedQuizId === 'all' && (
                    <TableCell sx={{ fontWeight: 600 }}>Quiz</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            ...getRankColor(rank),
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {rank}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{entry.student_name}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={entry.score}
                          color={rank <= 3 ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      {selectedQuizId === 'all' && (
                        <TableCell>
                          {(Array.isArray(entry.quizzes) ? entry.quizzes[0]?.title : entry.quizzes?.title) || 'Unknown'}
                        </TableCell>
                      )}
                      <TableCell>{formatDate(entry.created_at)}</TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
