import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, type Quiz } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Fab from '@mui/material/Fab';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HomeIcon from '@mui/icons-material/Home';
import LoadingScreen from '../components/LoadingScreen';

interface LeaderboardRow {
  id: string;
  student_name: string;
  score: number;
  quiz_id: string;
  created_at: string;
  quizzes: { title: string } | { title: string }[] | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useApp();
  const [tabValue, setTabValue] = useState(0);
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
      case 1:
        return { bgcolor: '#ffd700', color: '#000' };
      case 2:
        return { bgcolor: '#c0c0c0', color: '#000' };
      case 3:
        return { bgcolor: '#cd7f32', color: '#fff' };
      default:
        return { bgcolor: '#2a2a3e', color: '#eaeaea' };
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            QuizMaster
          </Typography>
          {isAdmin && (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            mb: 2,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
            },
          }}
        >
          <Tab
            icon={<QuizIcon sx={{ mr: 1 }} />}
            iconPosition="start"
            label="Quizzes"
          />
          <Tab
            icon={<EmojiEventsIcon sx={{ mr: 1 }} />}
            iconPosition="start"
            label="Leaderboard"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {quizzes.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No active quizzes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Check back later for new challenges
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                    },
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <QuizIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={600}>
                          {quiz.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate('/start')}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #c73e54 0%, #e94560 100%)',
                        },
                      }}
                    >
                      Start Quiz
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Quiz</InputLabel>
                <Select
                  value={selectedQuizId}
                  label="Filter by Quiz"
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                  <MenuItem value="all">All Quizzes</MenuItem>
                  {allQuizzes.map((quiz) => (
                    <MenuItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                      {quiz.is_active && (
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          sx={{ ml: 1, fontWeight: 600 }}
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
                              width: 36,
                              height: 36,
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
                            color={rank <= 3 ? 'secondary' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
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
        </TabPanel>
      </Container>

      {/* Floating Home Button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
        <Fab
          color="secondary"
          onClick={() => navigate('/')}
          sx={{
            boxShadow: '0 4px 20px rgba(233, 69, 96, 0.4)',
          }}
        >
          <HomeIcon />
        </Fab>
      </Box>
    </Box>
  );
}
