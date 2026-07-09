import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import LoadingScreen from '../components/LoadingScreen';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, signOut, loading: authLoading } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleActive = async (quiz: Quiz) => {
    if (quiz.is_active) {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: false })
        .eq('id', quiz.id);
      if (error) {
        showToast('Failed to deactivate quiz', 'error');
      } else {
        showToast('Quiz deactivated');
        fetchQuizzes();
      }
    } else {
      await supabase.from('quizzes').update({ is_active: false }).neq('id', quiz.id);
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: true })
        .eq('id', quiz.id);
      if (error) {
        showToast('Failed to activate quiz', 'error');
      } else {
        showToast('Quiz activated');
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
      showToast('Please enter a quiz title', 'error');
      return;
    }

    if (editingQuiz) {
      const { error } = await supabase
        .from('quizzes')
        .update({ title: quizDialogTitle.trim() })
        .eq('id', editingQuiz.id);
      if (error) {
        showToast('Failed to update quiz', 'error');
      } else {
        showToast('Quiz updated');
        setQuizDialogOpen(false);
        fetchQuizzes();
      }
    } else {
      const { error } = await supabase.from('quizzes').insert({
        title: quizDialogTitle.trim(),
        is_active: false,
      });
      if (error) {
        showToast('Failed to create quiz', 'error');
      } else {
        showToast('Quiz created');
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
        showToast('Failed to delete quiz', 'error');
      } else {
        showToast('Quiz deleted');
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
      showToast('Please enter question text', 'error');
      return;
    }
    if (!option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
      showToast('Please fill in all 4 options', 'error');
      return;
    }
    if (!correctAnswer) {
      showToast('Please select the correct answer', 'error');
      return;
    }
    if (!selectedQuizId) {
      showToast('Please select a quiz first', 'error');
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
        showToast('Failed to update question', 'error');
      } else {
        showToast('Question updated');
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
        showToast('Failed to create question', 'error');
      } else {
        showToast('Question created');
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
        showToast('Failed to delete question', 'error');
      } else {
        showToast('Question deleted');
        fetchQuestions(selectedQuizId);
      }
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (authLoading) return <LoadingScreen />;
  if (!isAdmin) return <Navigate to="/login" replace />;
  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <span className="navbar-title">Admin Dashboard</span>
          <button className="btn btn-ghost btn-small" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="container container-lg" style={{ paddingTop: '24px' }}>
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
            Questions
          </button>
        </div>

        {/* Quizzes Tab */}
        {tabValue === 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button className="btn btn-primary" onClick={() => handleOpenQuizDialog()}>
                + Add Quiz
              </button>
            </div>
            {quizzes.length === 0 ? (
              <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                <p className="text-secondary">No quizzes yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="table-container glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quiz Title</th>
                      <th style={{ textAlign: 'center' }}>Active</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td style={{ fontWeight: 500 }}>{quiz.title}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className={`switch ${quiz.is_active ? 'active' : ''}`}
                            onClick={() => handleToggleActive(quiz)}
                            title={quiz.is_active ? 'Click to deactivate' : 'Click to activate'}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-small"
                            onClick={() => handleOpenQuizDialog(quiz)}
                            style={{ marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-small"
                            onClick={() => handleDeleteQuiz(quiz)}
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Questions Tab */}
        {tabValue === 1 && (
          <>
            <div className="glass" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <select
                className="select"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                style={{ flex: 1 }}
              >
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} {quiz.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenQuestionDialog()}
                disabled={!selectedQuizId}
              >
                + Add Question
              </button>
            </div>

            {!selectedQuizId ? (
              <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                <p className="text-secondary">Select a quiz to manage questions.</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                <p className="text-secondary">No questions for this quiz. Add some to get started.</p>
              </div>
            ) : (
              <div className="table-container glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th style={{ textAlign: 'center' }}>Correct Answer</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id}>
                        <td>{question.question_text}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="chip chip-success">{question.correct_answer}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-small"
                            onClick={() => handleOpenQuestionDialog(question)}
                            style={{ marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-small"
                            onClick={() => handleDeleteQuestion(question)}
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quiz Dialog */}
      {quizDialogOpen && (
        <div className="modal-overlay" onClick={() => setQuizDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</h3>
            </div>
            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
                Quiz Title
              </label>
              <input
                type="text"
                className="input"
                value={quizDialogTitle}
                onChange={(e) => setQuizDialogTitle(e.target.value)}
                placeholder="Enter quiz title"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setQuizDialogOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveQuiz}>
                {editingQuiz ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Dialog */}
      {questionDialogOpen && (
        <div className="modal-overlay" onClick={() => setQuestionDialogOpen(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingQuestion ? 'Edit Question' : 'New Question'}</h3>
            </div>
            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
                Question Text
              </label>
              <input
                type="text"
                className="input"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question"
                autoFocus
                style={{ marginBottom: '16px' }}
              />

              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Answer Options</p>
              <input type="text" className="input" value={option1} onChange={(e) => setOption1(e.target.value)} placeholder="Option 1" style={{ marginBottom: '8px' }} />
              <input type="text" className="input" value={option2} onChange={(e) => setOption2(e.target.value)} placeholder="Option 2" style={{ marginBottom: '8px' }} />
              <input type="text" className="input" value={option3} onChange={(e) => setOption3(e.target.value)} placeholder="Option 3" style={{ marginBottom: '8px' }} />
              <input type="text" className="input" value={option4} onChange={(e) => setOption4(e.target.value)} placeholder="Option 4" style={{ marginBottom: '16px' }} />

              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Correct Answer</p>
              <div className="radio-group">
                {[option1, option2, option3, option4].filter(Boolean).map((opt) => (
                  <div
                    key={opt}
                    className={`radio-option ${correctAnswer === opt ? 'selected' : ''}`}
                    onClick={() => setCorrectAnswer(opt)}
                  >
                    <div className="radio-circle" />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setQuestionDialogOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveQuestion}>
                {editingQuestion ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialogOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialogOpen(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
            </div>
            <p className="text-secondary">{confirmDialogMessage}</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--accent-primary)' }}
                onClick={() => confirmDialogAction?.()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: toast.type === 'error' ? 'rgba(233, 69, 96, 0.9)' : 'rgba(0, 217, 165, 0.9)',
          color: 'white',
          borderRadius: '12px',
          fontWeight: 500,
          zIndex: 1001,
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
