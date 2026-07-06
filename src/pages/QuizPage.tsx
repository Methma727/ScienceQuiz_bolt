import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LoadingScreen from '../components/LoadingScreen';

interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { studentName } = useApp();
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchActiveQuiz = useCallback(async () => {
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, is_active, created_at')
      .eq('is_active', true)
      .maybeSingle();

    if (quizError || !quizData) {
      setLoading(false);
      return;
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id, quiz_id, question_text, options, correct_answer, created_at')
      .eq('quiz_id', quizData.id)
      .order('created_at', { ascending: true });

    if (questionsError || !questionsData || questionsData.length === 0) {
      setLoading(false);
      return;
    }

    // Check if student already completed this quiz
    if (studentName) {
      const { data: existingEntry } = await supabase
        .from('leaderboard')
        .select('id')
        .eq('quiz_id', quizData.id)
        .eq('student_name', studentName)
        .maybeSingle();

      if (existingEntry) {
        navigate('/leaderboard', { replace: true });
        return;
      }
    }

    setQuiz({
      ...quizData,
      questions: questionsData,
    });
    setLoading(false);
  }, [studentName, navigate]);

  useEffect(() => {
    fetchActiveQuiz();
  }, [fetchActiveQuiz]);

  const currentQuestion = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswer = (answer: string) => {
    if (answered || !currentQuestion) return;

    setAnswered(answer);
    const correct = answer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (!quiz) return;

    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(null);
      setIsCorrect(null);
    } else {
      setSubmitting(true);
      const finalScore = score + (isCorrect ? 1 : 0);

      if (studentName) {
        await supabase.from('leaderboard').insert({
          student_name: studentName,
          score: finalScore,
          quiz_id: quiz.id,
        });
      } else {
        const name = sessionStorage.getItem('studentName') || 'Anonymous';
        await supabase.from('leaderboard').insert({
          student_name: name,
          score: finalScore,
          quiz_id: quiz.id,
        });
      }

      setScore(finalScore);
      setCompleted(true);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Active Quiz
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              There is no quiz available right now. Check back later!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/leaderboard')}
              sx={{ mr: 1 }}
            >
              View Leaderboard
            </Button>
            <Button variant="outlined" onClick={() => navigate('/start')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (completed) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card sx={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              {percentage >= 80 ? (
                <EmojiEventsIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
              ) : percentage >= 50 ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              ) : (
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              )}
              <Typography variant="h4" gutterBottom>
                Quiz Complete!
              </Typography>
              <Chip
                label={`${quiz.title}`}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="h2" color="primary" fontWeight={700} gutterBottom>
                {score} / {totalQuestions}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You scored {percentage}% correct answers
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, textAlign: 'center' }}>
        <Typography variant="h6">{quiz.title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Question {currentIndex + 1} of {totalQuestions}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1,
            bgcolor: 'primary.dark',
            '& .MuiLinearProgress-bar': { bgcolor: 'white' },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: 600 }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                  {currentQuestion?.question_text}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = answered === option;
                    const isRight = option === currentQuestion.correct_answer;
                    let variant: 'outlined' | 'contained' = 'outlined';
                    let color:
                      | 'primary'
                      | 'secondary'
                      | 'success'
                      | 'error'
                      | 'inherit' = 'primary';

                    if (answered) {
                      if (isRight) {
                        variant = 'contained';
                        color = 'success';
                      } else if (isSelected && !isRight) {
                        variant = 'contained';
                        color = 'error';
                      }
                    }

                    return (
                      <Button
                        key={idx}
                        variant={variant}
                        color={color}
                        size="large"
                        onClick={() => handleAnswer(option)}
                        disabled={!!answered}
                        sx={{
                          justifyContent: 'flex-start',
                          py: 1.5,
                          px: 2,
                          textTransform: 'none',
                          fontSize: '1rem',
                        }}
                        startIcon={
                          answered && isRight ? (
                            <CheckCircleOutlineIcon />
                          ) : answered && isSelected && !isRight ? (
                            <CancelOutlinedIcon />
                          ) : null
                        }
                      >
                        {option}
                      </Button>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          disabled={!answered || submitting}
          onClick={handleNext}
          sx={{ minWidth: 200 }}
        >
          {submitting
            ? 'Submitting...'
            : currentIndex < totalQuestions - 1
            ? 'Next Question'
            : 'Finish Quiz'}
        </Button>
      </Box>
    </Box>
  );
}
