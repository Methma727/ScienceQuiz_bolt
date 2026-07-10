import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { useApp } from '../context/AppContext';
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
      .select('id, title, is_active, starts_at, ends_at, created_at')
      .eq('is_active', true)
      .maybeSingle();

    if (quizError || !quizData) {
      setLoading(false);
      return;
    }

    const now = new Date();
    if (quizData.starts_at && new Date(quizData.starts_at) > now) {
      setLoading(false);
      return;
    }
    if (quizData.ends_at && new Date(quizData.ends_at) < now) {
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
        navigate('/main', { replace: true });
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '24px',
      }}>
        <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>?</div>
          <h2 style={{ marginBottom: '8px' }}>No Active Quiz</h2>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            There is no quiz available right now. Check back later!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/main')}>
              View Leaderboard
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/start')}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '24px',
      }}>
        <div className="glass animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}>
          {percentage >= 80 ? (
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
          ) : percentage >= 50 ? (
            <div style={{ fontSize: '64px', marginBottom: '16px', color: 'var(--accent-success)' }}>✓</div>
          ) : (
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>😔</div>
          )}
          <h2 style={{ marginBottom: '8px' }}>Quiz Complete!</h2>
          <span className="chip chip-primary mb-3">{quiz.title}</span>
          <div style={{
            fontSize: '3rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '16px 0',
          }}>
            {score} / {totalQuestions}
          </div>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            You scored {percentage}% correct answers
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/main')}
            style={{ width: '100%' }}
          >
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1), rgba(255, 107, 107, 0.05))',
        borderBottom: '1px solid var(--glass-border)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{quiz.title}</h3>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>
            Question {currentIndex + 1} of {totalQuestions}
          </p>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      }}>
        <div className="glass" style={{ maxWidth: '600px', width: '100%', padding: '24px' }} key={currentIndex}>
          <h3 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '1.25rem' }}>
            {currentQuestion?.question_text}
          </h3>
          <div className="options-grid">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = answered === option;
              const isRight = option === currentQuestion.correct_answer;
              let className = 'option-btn';

              if (answered) {
                if (isRight) {
                  className += ' correct';
                } else if (isSelected && !isRight) {
                  className += ' incorrect';
                }
              }

              return (
                <button
                  key={idx}
                  className={className}
                  onClick={() => handleAnswer(option)}
                  disabled={!!answered}
                >
                  {answered && isRight && <span style={{ color: 'var(--accent-success)' }}>✓</span>}
                  {answered && isSelected && !isRight && <span style={{ color: 'var(--accent-primary)' }}>✗</span>}
                  <span style={{ flex: 1 }}>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          disabled={!answered || submitting}
          onClick={handleNext}
          style={{ minWidth: '200px' }}
        >
          {submitting
            ? 'Submitting...'
            : currentIndex < totalQuestions - 1
            ? 'Next Question'
            : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
}
