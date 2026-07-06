import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
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
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingScreen from '../components/LoadingScreen';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, signOut, loading: authLoading } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog states
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizDialogTitle, setQuizDialogTitle] = useState('');
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<(() => void) | null>(null);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchQuestions(selectedQuizId);
    }
  }, [selectedQuizId]);

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    setQuizzes(data || []);
    if (data && data.length > 0 && !selectedQuizId) {
      setSelectedQuizId(data[0].id);
    }
    setLoading(false);
  };

  const fetchQuestions = async (quizId: string) => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });
    setQuestions(data || []);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleToggleActive = async (quiz: Quiz) => {
    if (quiz.is_active) {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: false })
        .eq('id', quiz.id);
      if (error) {
        showSnackbar('Failed to deactivate quiz', 'error');
      } else {
        showSnackbar('Quiz deactivated');
        fetchQuizzes();
      }
    } else {
      await supabase.from('quizzes').update({ is_active: false }).neq('id', quiz.id);
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: true })
        .eq('id', quiz.id);
      if (error) {
        showSnackbar('Failed to activate quiz', 'error');
      } else {
        showSnackbar('Quiz activated');
        fetchQuizzes();
      }
    }
  };

  const handleOpenQuizDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizDialogTitle(quiz.title);
    } else {
      setEditingQuiz(null);
      setQuizDialogTitle('');
    }
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizDialogTitle.trim()) {
      showSnackbar('Please enter a quiz title', 'error');
      return;
    }

    if (editingQuiz) {
      const { error } = await supabase
        .from('quizzes')
        .update({ title: quizDialogTitle.trim() })
        .eq('id', editingQuiz.id);
      if (error) {
        showSnackbar('Failed to update quiz', 'error');
      } else {
        showSnackbar('Quiz updated');
        setQuizDialogOpen(false);
        fetchQuizzes();
      }
    } else {
      const { error } = await supabase.from('quizzes').insert({
        title: quizDialogTitle.trim(),
        is_active: false,
      });
      if (error) {
        showSnackbar('Failed to create quiz', 'error');
      } else {
        showSnackbar('Quiz created');
        setQuizDialogOpen(false);
        fetchQuizzes();
      }
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setConfirmDialogMessage(`Delete "${quiz.title}" and all its questions?`);
    setConfirmDialogAction(() => async () => {
      const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id);
      if (error) {
        showSnackbar('Failed to delete quiz', 'error');
      } else {
        showSnackbar('Quiz deleted');
        fetchQuizzes();
        if (selectedQuizId === quiz.id) {
          setSelectedQuizId('');
        }
      }
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const handleOpenQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionText(question.question_text);
      setOption1(question.options[0] || '');
      setOption2(question.options[1] || '');
      setOption3(question.options[2] || '');
      setOption4(question.options[3] || '');
      setCorrectAnswer(question.correct_answer);
    } else {
      setEditingQuestion(null);
      setQuestionText('');
      setOption1('');
      setOption2('');
      setOption3('');
      setOption4('');
      setCorrectAnswer('');
    }
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      showSnackbar('Please enter question text', 'error');
      return;
    }
    if (!option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
      showSnackbar('Please fill in all 4 options', 'error');
      return;
    }
    if (!correctAnswer) {
      showSnackbar('Please select the correct answer', 'error');
      return;
    }
    if (!selectedQuizId) {
      showSnackbar('Please select a quiz first', 'error');
      return;
    }

    const options = [option1.trim(), option2.trim(), option3.trim(), option4.trim()];

    if (editingQuestion) {
      const { error } = await supabase
        .from('questions')
        .update({
          question_text: questionText.trim(),
          options,
          correct_answer: correctAnswer,
        })
        .eq('id', editingQuestion.id);
      if (error) {
        showSnackbar('Failed to update question', 'error');
      } else {
        showSnackbar('Question updated');
        setQuestionDialogOpen(false);
        fetchQuestions(selectedQuizId);
      }
    } else {
      const { error } = await supabase.from('questions').insert({
        quiz_id: selectedQuizId,
        question_text: questionText.trim(),
        options,
        correct_answer: correctAnswer,
      });
      if (error) {
        showSnackbar('Failed to create question', 'error');
      } else {
        showSnackbar('Question created');
        setQuestionDialogOpen(false);
        fetchQuestions(selectedQuizId);
      }
    }
  };

  const handleDeleteQuestion = (question: Question) => {
    setConfirmDialogMessage('Delete this question?');
    setConfirmDialogAction(() => async () => {
      const { error } = await supabase.from('questions').delete().eq('id', question.id);
      if (error) {
        showSnackbar('Failed to delete question', 'error');
      } else {
        showSnackbar('Question deleted');
        fetchQuestions(selectedQuizId);
      }
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
          <Tooltip title="Sign Out">
            <IconButton color="inherit" onClick={handleSignOut}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="Quizzes" />
          <Tab label="Questions" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenQuizDialog()}
            >
              Add Quiz
            </Button>
          </Box>
          {quizzes.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No quizzes yet. Create one to get started.</Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Quiz Title</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Questions</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{quiz.title}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={quiz.is_active ? 'Click to deactivate' : 'Click to activate'}>
                          <Switch
                            checked={quiz.is_active}
                            onChange={() => handleToggleActive(quiz)}
                            color="success"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={quiz.is_active ? 'Active' : 'Inactive'}
                          color={quiz.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenQuizDialog(quiz)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteQuiz(quiz)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth>
                <InputLabel>Select Quiz</InputLabel>
                <Select
                  value={selectedQuizId}
                  label="Select Quiz"
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                  {quizzes.map((quiz) => (
                    <MenuItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                      {quiz.is_active && <Chip label="Active" size="small" color="success" sx={{ ml: 1 }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenQuestionDialog()}
                disabled={!selectedQuizId}
              >
                Add Question
              </Button>
            </CardContent>
          </Card>
          {!selectedQuizId ? (
            <Card>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Select a quiz to manage questions.</Typography>
              </CardContent>
            </Card>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No questions for this quiz. Add some to get started.</Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Correct Answer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id} hover>
                      <TableCell>
                        <Typography>{question.question_text}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={question.correct_answer} color="success" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenQuestionDialog(question)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteQuestion(question)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Container>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onClose={() => setQuizDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Quiz Title"
            value={quizDialogTitle}
            onChange={(e) => setQuizDialogTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveQuiz}>
            {editingQuiz ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onClose={() => setQuestionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'New Question'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Question Text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Answer Options
          </Typography>
          <TextField fullWidth label="Option 1" value={option1} onChange={(e) => setOption1(e.target.value)} sx={{ mb: 1 }} />
          <TextField fullWidth label="Option 2" value={option2} onChange={(e) => setOption2(e.target.value)} sx={{ mb: 1 }} />
          <TextField fullWidth label="Option 3" value={option3} onChange={(e) => setOption3(e.target.value)} sx={{ mb: 1 }} />
          <TextField fullWidth label="Option 4" value={option4} onChange={(e) => setOption4(e.target.value)} />
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Correct Answer
          </Typography>
          <FormControl>
            <RadioGroup value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}>
              <FormControlLabel value={option1} control={<Radio />} label={option1 || 'Option 1'} disabled={!option1} />
              <FormControlLabel value={option2} control={<Radio />} label={option2 || 'Option 2'} disabled={!option2} />
              <FormControlLabel value={option3} control={<Radio />} label={option3 || 'Option 3'} disabled={!option3} />
              <FormControlLabel value={option4} control={<Radio />} label={option4 || 'Option 4'} disabled={!option4} />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveQuestion}>
            {editingQuestion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirmDialogAction?.();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
