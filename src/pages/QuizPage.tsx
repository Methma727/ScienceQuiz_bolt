import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { collectBrowserInfo, fetchLocationInfo } from '../lib/fingerprint';
import { useApp } from '../context/AppContext';
import { sound } from '../lib/sound';
import LoadingScreen from '../components/LoadingScreen';
import Confetti from '../components/Confetti';

interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

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
  const [showConfetti, setShowConfetti] = useState(false);

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

    setQuiz({ ...quizData, questions: questionsData });
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
      // Score is incremented here on every answer, so it already reflects the
      // final question by the time the quiz is submitted. Do NOT add isCorrect
      // again in handleNext — that would double-count the last correct answer.
      setScore((prev) => prev + 1);
      sound.play('success');
    } else {
      sound.play('error');
    }
  };

  const handleNext = async () => {
    if (!quiz) return;

    if (currentIndex < quiz.questions.length - 1) {
      sound.play('whoosh');
      setCurrentIndex((prev) => prev + 1);
      setAnswered(null);
      setIsCorrect(null);
    } else {
      setSubmitting(true);
      // `score` already includes the current (last) question because
      // handleAnswer updates it immediately. No extra +1 needed.
      const finalScore = score;

      const name = studentName || sessionStorage.getItem('studentName') || 'Anonymous';

      const [browserInfo, locationInfo] = await Promise.all([
        collectBrowserInfo(),
        fetchLocationInfo(),
      ]);

      await supabase.from('leaderboard').insert({
        student_name: name,
        score: finalScore,
        quiz_id: quiz.id,
        browser_info: browserInfo,
        ip_address: locationInfo?.ip || null,
        location: locationInfo ? {
          ip: locationInfo.ip,
          country: locationInfo.country,
          region: locationInfo.region,
          city: locationInfo.city,
          timezone: locationInfo.timezone,
          isp: locationInfo.isp,
        } : null,
      });

      setScore(finalScore);
      setCompleted(true);
      setSubmitting(false);

      const percentage = Math.round((finalScore / totalQuestions) * 100);
      if (percentage >= 50) {
        setShowConfetti(true);
        sound.play('complete');
      }
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="glass-elevated animate-fade-in" style={{ maxWidth: '420px', width: '100%', padding: '36px', textAlign: 'center' }}>
          <div className="animate-float" style={{ width: '72px', height: '72px', margin: '0 auto 18px', background: 'var(--glass-bg)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🚀</div>
          <h2 className="font-display" style={{ marginBottom: '8px' }}>No Active Quiz</h2>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            There is no quiz available right now. Check back later!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/main')}>View Leaderboard</button>
            <button className="btn btn-secondary" onClick={() => navigate('/start')}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const tier = percentage >= 80 ? 'gold' : percentage >= 50 ? 'good' : 'try';
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
        {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
        <div className="glass-elevated animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Score ring */}
          <ScoreRing percentage={percentage} tier={tier} />

          <h2 className="font-display" style={{ marginBottom: '6px', fontSize: '1.6rem' }}>
            {tier === 'gold' ? 'Outstanding!' : tier === 'good' ? 'Well Done!' : 'Keep Practicing!'}
          </h2>
          <div style={{ marginBottom: '6px' }}>
            <span className="chip chip-primary">{quiz.title}</span>
          </div>
          <div
            className="font-display text-gradient"
            style={{ fontSize: '3rem', fontWeight: 800, margin: '16px 0 4px' }}
          >
            {score} / {totalQuestions}
          </div>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            You scored {percentage}% correct answers
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/main')} style={{ width: '100%', padding: '14px' }}>
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Home button */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost btn-small"
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        Home
      </button>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--accent-soft), rgba(255,255,255,0.02))', borderBottom: '1px solid var(--glass-border)', padding: '18px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 className="font-display" style={{ fontWeight: 700 }}>{quiz.title}</h3>
            <span className="chip chip-default">
              <span style={{ color: 'var(--accent-primary)' }}>{currentIndex + 1}</span>
              <span className="text-muted">/ {totalQuestions}</span>
            </span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
        <div className="glass-elevated" style={{ maxWidth: '640px', width: '100%', padding: '28px' }} key={currentIndex}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="chip chip-primary">Question {currentIndex + 1}</span>
            {answered && (
              <span className={`chip animate-fade-in ${isCorrect ? 'chip-success' : 'chip-primary'}`}>
                {isCorrect ? 'Correct!' : 'Not quite'}
              </span>
            )}
          </div>
          <h3 className="font-display" style={{ marginBottom: '24px', fontSize: '1.3rem', lineHeight: 1.4 }}>
            {currentQuestion?.question_text}
          </h3>
          <div className="options-grid">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = answered === option;
              const isRight = option === currentQuestion.correct_answer;
              let className = 'option-btn';

              if (answered) {
                if (isRight) className += ' correct';
                else if (isSelected && !isRight) className += ' incorrect';
              }

              return (
                <button key={idx} className={className} onClick={() => handleAnswer(option)} disabled={!!answered}>
                  <span
                    className="font-display"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: answered && isRight ? 'var(--accent-success)' : answered && isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {answered && isRight ? '✓' : answered && isSelected ? '✗' : OPTION_LABELS[idx]}
                  </span>
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
          style={{ minWidth: '220px' }}
        >
          {submitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...
            </span>
          ) : currentIndex < totalQuestions - 1 ? (
            <>Next Question →</>
          ) : (
            'Finish Quiz'
          )}
        </button>
      </div>
    </div>
  );
}

/** Animated circular score indicator for the results screen. */
function ScoreRing({ percentage, tier }: { percentage: number; tier: 'gold' | 'good' | 'try' }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setShown(Math.round(percentage * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [percentage]);

  const emoji = tier === 'gold' ? '🏆' : tier === 'good' ? '✨' : '💪';
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 8px' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * shown) / 100}
          style={{ transition: 'stroke-dashoffset 60ms linear' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-1)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '28px', lineHeight: 1 }}>{emoji}</span>
        <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{shown}%</span>
      </div>
    </div>
  );
}
