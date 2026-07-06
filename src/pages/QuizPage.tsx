import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent, Chip, ProgressBar } from '@heroui/react';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Trophy, Frown, CheckCircle, XCircle } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-screen bg-bg-default p-4">
        <Card className="max-w-[420px] w-full text-center">
          <CardContent className="p-8">
            <Frown className="mx-auto mb-3" size={64} style={{ color: '#a0a0a0' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#eaeaea' }}>No Active Quiz</h3>
            <p className="text-sm text-text-secondary mb-4">
              There is no quiz available right now. Check back later!
            </p>
            <Button onPress={() => navigate('/leaderboard')} className="mr-2">
              View Leaderboard
            </Button>
            <Button variant="outline" onPress={() => navigate('/start')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <div className="flex justify-center items-center min-h-screen bg-bg-default p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="max-w-[420px] w-full text-center">
            <CardContent className="p-8">
              {percentage >= 80 ? (
                <Trophy className="mx-auto mb-3" size={64} color="#e94560" />
              ) : percentage >= 50 ? (
                <CheckCircle className="mx-auto mb-3" size={64} color="#00d9a5" />
              ) : (
                <Frown className="mx-auto mb-3" size={64} style={{ color: '#a0a0a0' }} />
              )}
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#eaeaea' }}>Quiz Complete!</h3>
              <Chip variant="outline" color="primary" className="mb-3">{quiz.title}</Chip>
              <h2 className="text-4xl font-bold mb-2" style={{ color: '#e94560' }}>
                {score} / {totalQuestions}
              </h2>
              <p className="text-base text-text-secondary mb-4">
                You scored {percentage}% correct answers
              </p>
              <Button fullWidth size="lg" onPress={() => navigate('/leaderboard')}>
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-default">
      <div className="p-4 text-center" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <p className="text-sm opacity-80">Question {currentIndex + 1} of {totalQuestions}</p>
        <ProgressBar
          value={progress}
          className="mt-3"
        />
      </div>

      <div className="flex-1 flex justify-center items-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[600px]"
          >
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h4 className="text-xl font-semibold mb-4 text-center" style={{ color: '#eaeaea' }}>
                  {currentQuestion?.question_text}
                </h4>
                <div className="flex flex-col gap-2">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = answered === option;
                    const isRight = option === currentQuestion.correct_answer;
                    let variant: 'solid' | 'outline' | 'ghost' = 'outline';
                    let color = 'default';

                    if (answered) {
                      if (isRight) {
                        variant = 'solid';
                        color = 'success';
                      } else if (isSelected && !isRight) {
                        variant = 'solid';
                        color = 'danger';
                      }
                    }

                    return (
                      <Button
                        key={idx}
                        variant={variant}
                        size="lg"
                        isDisabled={!!answered}
                        onPress={() => handleAnswer(option)}
                        className="justify-start py-4 px-3 text-base"
                        color={color as any}
                        startContent={
                          answered && isRight ? (
                            <CheckCircle size={20} />
                          ) : answered && isSelected && !isRight ? (
                            <XCircle size={20} />
                          ) : null
                        }
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 flex justify-center">
        <Button
          variant="solid"
          size="lg"
          isDisabled={!answered || submitting}
          onPress={handleNext}
          className="min-w-[200px]"
        >
          {submitting
            ? 'Submitting...'
            : currentIndex < totalQuestions - 1
            ? 'Next Question'
            : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
}
