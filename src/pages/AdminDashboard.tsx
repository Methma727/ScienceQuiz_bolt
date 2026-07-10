import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { fetchQuestionsFromSheet, type ParsedQuestion } from '../lib/googleSheets';
import { useApp } from '../context/AppContext';
import LoadingScreen from '../components/LoadingScreen';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, signOut, loading: authLoading } = useApp();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dialog states
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizDialogTitle, setQuizDialogTitle] = useState('');
  const [quizStartsAt, setQuizStartsAt] = useState('');
  const [quizEndsAt, setQuizEndsAt] = useState('');
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

  // Import from Google Sheets
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<ParsedQuestion[]>([]);
  const [importSheetRange, setImportSheetRange] = useState('Sheet1!A:F');
  const [importSpreadsheetId, setImportSpreadsheetId] = useState('');
  const [importError, setImportError] = useState('');
  const [importStep, setImportStep] = useState<'config' | 'preview'>('config');

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
      setQuizStartsAt(quiz.starts_at ? quiz.starts_at.slice(0, 16) : '');
      setQuizEndsAt(quiz.ends_at ? quiz.ends_at.slice(0, 16) : '');
    } else {
      setEditingQuiz(null);
      setQuizDialogTitle('');
      setQuizStartsAt('');
      setQuizEndsAt('');
    }
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizDialogTitle.trim()) {
      showToast('Please enter a quiz title', 'error');
      return;
    }

    const scheduleData = {
      starts_at: quizStartsAt ? new Date(quizStartsAt).toISOString() : null,
      ends_at: quizEndsAt ? new Date(quizEndsAt).toISOString() : null,
    };

    if (editingQuiz) {
      const { error } = await supabase
        .from('quizzes')
        .update({ title: quizDialogTitle.trim(), ...scheduleData })
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
        ...scheduleData,
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

  const handleOpenImportDialog = () => {
    setImportPreview([]);
    setImportError('');
    setImportStep('config');
    setImportSheetRange('Sheet1!A:F');
    setImportSpreadsheetId('');
    setImportDialogOpen(true);
  };

  const handleFetchFromSheet = async () => {
    if (!selectedQuizId) {
      showToast('Please select a quiz first', 'error');
      return;
    }
    setImportLoading(true);
    setImportError('');
    try {
      const id = importSpreadsheetId.trim() || undefined;
      const questions = await fetchQuestionsFromSheet(importSheetRange.trim(), id);
      setImportPreview(questions);
      setImportStep('preview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch from Google Sheet';
      setImportError(message);
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportFromSheet = async () => {
    if (!selectedQuizId || importPreview.length === 0) return;

    setImportLoading(true);
    try {
      const rows = importPreview.map((q) => ({
        quiz_id: selectedQuizId,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
      }));

      const { error } = await supabase.from('questions').insert(rows);
      if (error) {
        showToast('Failed to import questions', 'error');
      } else {
        showToast(`Imported ${rows.length} questions`);
        setImportDialogOpen(false);
        fetchQuestions(selectedQuizId);
      }
    } catch {
      showToast('Failed to import questions', 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const getScheduleStatus = (quiz: Quiz) => {
    const now = new Date();
    if (quiz.starts_at && new Date(quiz.starts_at) > now) return 'scheduled';
    if (quiz.ends_at && new Date(quiz.ends_at) < now) return 'expired';
    if (quiz.starts_at || quiz.ends_at) return 'in-progress';
    return null;
  };

  const formatScheduleDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Your Quizzes</h2>
          <button className="btn btn-primary" onClick={() => handleOpenQuizDialog()}>
            + Add Quiz
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
            <p className="text-secondary">No quizzes yet. Create one to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {quizzes.map((quiz) => {
              const schedStatus = getScheduleStatus(quiz);
              const isExpanded = selectedQuizId === quiz.id;
              return (
                <div key={quiz.id} className="glass" style={{ overflow: 'hidden' }}>
                  {/* Quiz Row */}
                  <div
                    onClick={() => setSelectedQuizId(isExpanded ? '' : quiz.id)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      borderBottom: isExpanded ? '1px solid var(--glass-border)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', opacity: 0.4, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>▶</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{quiz.title}</div>
                      <div style={{ fontSize: '0.8125rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {quiz.is_active ? (
                          <span className="chip chip-success" style={{ fontSize: '0.75rem' }}>Active</span>
                        ) : (
                          <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>Inactive</span>
                        )}
                        {schedStatus === 'scheduled' && (
                          <span className="chip chip-default" style={{ fontSize: '0.75rem' }}>Scheduled</span>
                        )}
                        {schedStatus === 'expired' && (
                          <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(233,69,96,0.15)', color: 'var(--accent-primary)' }}>Expired</span>
                        )}
                        {quiz.starts_at && (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>From {formatScheduleDate(quiz.starts_at)}</span>
                        )}
                        {quiz.ends_at && (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Until {formatScheduleDate(quiz.ends_at)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`switch ${quiz.is_active ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(quiz); }}
                      title={quiz.is_active ? 'Deactivate' : 'Activate'}
                    />
                    <button
                      className="btn btn-ghost btn-small"
                      onClick={(e) => { e.stopPropagation(); handleOpenQuizDialog(quiz); }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-small"
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Expanded: Questions */}
                  {isExpanded && (
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                          {questions.length} question{questions.length !== 1 ? 's' : ''}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-small" onClick={() => handleOpenQuestionDialog()}>
                            + Add
                          </button>
                          <button className="btn btn-ghost btn-small" onClick={handleOpenImportDialog}>
                            Import from Sheet
                          </button>
                        </div>
                      </div>
                      {questions.length === 0 ? (
                        <p className="text-muted" style={{ fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>
                          No questions yet. Add some or import from Google Sheet.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {questions.map((q) => (
                            <div
                              key={q.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.04)',
                              }}
                            >
                              <div style={{ flex: 1, fontSize: '0.875rem' }}>{q.question_text}</div>
                              <span className="chip chip-success" style={{ fontSize: '0.75rem' }}>{q.correct_answer}</span>
                              <button className="btn btn-ghost btn-small" onClick={() => handleOpenQuestionDialog(q)}>Edit</button>
                              <button className="btn btn-ghost btn-small" onClick={() => handleDeleteQuestion(q)} style={{ color: 'var(--accent-primary)' }}>Del</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                style={{ marginBottom: '16px' }}
              />

              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Schedule (optional)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem' }}>
                    Goes Live
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={quizStartsAt}
                    onChange={(e) => setQuizStartsAt(e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem' }}>
                    Ends
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={quizEndsAt}
                    onChange={(e) => setQuizEndsAt(e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '16px' }}>
                Leave empty for no time restrictions. Students can only see the quiz between these dates.
              </p>
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

      {/* Import from Google Sheet Dialog */}
      {importDialogOpen && (
        <div className="modal-overlay" onClick={() => !importLoading && setImportDialogOpen(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import from Google Sheet</h3>
            </div>

            {importStep === 'config' && (
              <div>
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>
                  Your sheet should have these columns: Question, Option1, Option2, Option3, Option4, CorrectAnswer
                </p>
                <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
                  Spreadsheet ID
                </label>
                <input
                  type="text"
                  className="input"
                  value={importSpreadsheetId}
                  onChange={(e) => setImportSpreadsheetId(e.target.value)}
                  placeholder="Leave empty to use default from .env"
                  style={{ marginBottom: '12px' }}
                />
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '-8px', marginBottom: '12px' }}>
                  Find it in the sheet URL: docs.google.com/spreadsheets/d/<strong>THIS_PART</strong>/edit
                </p>
                <label className="text-secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
                  Sheet Range
                </label>
                <input
                  type="text"
                  className="input"
                  value={importSheetRange}
                  onChange={(e) => setImportSheetRange(e.target.value)}
                  placeholder="Sheet1!A:F"
                />
                {importError && (
                  <p style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', marginTop: '8px' }}>
                    {importError}
                  </p>
                )}
              </div>
            )}

            {importStep === 'preview' && (
              <div>
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>
                  Preview — {importPreview.length} question{importPreview.length !== 1 ? 's' : ''} found:
                </p>
                <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '8px' }}>
                  <table className="table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Options</th>
                        <th>Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((q, i) => (
                        <tr key={i}>
                          <td>{q.question_text}</td>
                          <td>{q.options.join(' | ')}</td>
                          <td style={{ color: 'var(--accent-success)' }}>{q.correct_answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importError && (
                  <p style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                    {importError}
                  </p>
                )}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (importStep === 'preview') {
                    setImportStep('config');
                    setImportPreview([]);
                    setImportError('');
                  } else {
                    setImportDialogOpen(false);
                  }
                }}
                disabled={importLoading}
              >
                {importStep === 'preview' ? 'Back' : 'Cancel'}
              </button>
              {importStep === 'config' ? (
                <button className="btn btn-primary" onClick={handleFetchFromSheet} disabled={importLoading}>
                  {importLoading ? 'Fetching...' : 'Fetch'}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleImportFromSheet} disabled={importLoading || importPreview.length === 0}>
                  {importLoading ? 'Importing...' : 'Import All'}
                </button>
              )}
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
