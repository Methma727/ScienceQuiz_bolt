import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button, Card, CardContent, Chip, Input, Switch, Tabs, Tab, Tooltip, TextField, Label, Modal, useOverlayState, Radio, RadioGroup, toast } from '@heroui/react';
import { supabase, type Quiz, type Question } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, LogOut } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, signOut, loading: authLoading } = useApp();
  const [tabValue, setTabValue] = useState('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const quizDialog = useOverlayState();
  const questionDialog = useOverlayState();
  const confirmDialog = useOverlayState();

  const [quizDialogTitle, setQuizDialogTitle] = useState('');
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogAction, setConfirmDialogAction] = useState<(() => void) | null>(null);

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

  const handleToggleActive = async (quiz: Quiz) => {
    if (quiz.is_active) {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: false })
        .eq('id', quiz.id);
      if (error) {
        toast.danger('Failed to deactivate quiz');
      } else {
        toast.success('Quiz deactivated');
        fetchQuizzes();
      }
    } else {
      await supabase.from('quizzes').update({ is_active: false }).neq('id', quiz.id);
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: true })
        .eq('id', quiz.id);
      if (error) {
        toast.danger('Failed to activate quiz');
      } else {
        toast.success('Quiz activated');
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
    quizDialog.open();
  };

  const handleSaveQuiz = async () => {
    if (!quizDialogTitle.trim()) {
      toast.danger('Please enter a quiz title');
      return;
    }

    if (editingQuiz) {
      const { error } = await supabase
        .from('quizzes')
        .update({ title: quizDialogTitle.trim() })
        .eq('id', editingQuiz.id);
      if (error) {
        toast.danger('Failed to update quiz');
      } else {
        toast.success('Quiz updated');
        quizDialog.close();
        fetchQuizzes();
      }
    } else {
      const { error } = await supabase.from('quizzes').insert({
        title: quizDialogTitle.trim(),
        is_active: false,
      });
      if (error) {
        toast.danger('Failed to create quiz');
      } else {
        toast.success('Quiz created');
        quizDialog.close();
        fetchQuizzes();
      }
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setConfirmDialogMessage(`Delete "${quiz.title}" and all its questions?`);
    setConfirmDialogAction(() => async () => {
      const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id);
      if (error) {
        toast.danger('Failed to delete quiz');
      } else {
        toast.success('Quiz deleted');
        fetchQuizzes();
        if (selectedQuizId === quiz.id) {
          setSelectedQuizId('');
        }
      }
      confirmDialog.close();
    });
    confirmDialog.open();
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
    questionDialog.open();
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      toast.danger('Please enter question text');
      return;
    }
    if (!option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
      toast.danger('Please fill in all 4 options');
      return;
    }
    if (!correctAnswer) {
      toast.danger('Please select the correct answer');
      return;
    }
    if (!selectedQuizId) {
      toast.danger('Please select a quiz first');
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
        toast.danger('Failed to update question');
      } else {
        toast.success('Question updated');
        questionDialog.close();
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
        toast.danger('Failed to create question');
      } else {
        toast.success('Question created');
        questionDialog.close();
        fetchQuestions(selectedQuizId);
      }
    }
  };

  const handleDeleteQuestion = (question: Question) => {
    setConfirmDialogMessage('Delete this question?');
    setConfirmDialogAction(() => async () => {
      const { error } = await supabase.from('questions').delete().eq('id', question.id);
      if (error) {
        toast.danger('Failed to delete question');
      } else {
        toast.success('Question deleted');
        fetchQuestions(selectedQuizId);
      }
      confirmDialog.close();
    });
    confirmDialog.open();
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
    <div className="min-h-screen bg-bg-default">
      <header className="flex items-center px-4 py-3 border-b border-[#2a2a3e] bg-[#0f0f23]">
        <h1 className="flex-1 text-lg font-semibold text-white">Admin Dashboard</h1>
        <Tooltip>
          <Button isIconOnly variant="ghost" onPress={handleSignOut}>
            <LogOut size={20} />
          </Button>
          <Tooltip.Content>Sign Out</Tooltip.Content>
        </Tooltip>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <Tabs selectedKey={tabValue} onSelectionChange={(key) => setTabValue(key as string)}>
          <Tab id="quizzes">Quizzes</Tab>
          <Tab id="questions">Questions</Tab>
        </Tabs>

        {tabValue === 'quizzes' && (
          <div className="mt-4">
            <div className="flex justify-end mb-3">
              <Button onPress={() => handleOpenQuizDialog()}>
                <Plus size={20} /> Add Quiz
              </Button>
            </div>
            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-text-secondary">No quizzes yet. Create one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border border-[#2a2a3e] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#14141f' }}>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Quiz Title</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm">Questions</th>
                      <th className="px-4 py-3 text-right font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id} className="border-t border-[#2a2a3e] hover:bg-[rgba(233,69,96,0.04)]">
                        <td className="px-4 py-3 font-medium text-white">{quiz.title}</td>
                        <td className="px-4 py-3 text-center">
                          <Tooltip>
                            <Switch
                              isSelected={quiz.is_active}
                              onChange={() => handleToggleActive(quiz)}
                            />
                            <Tooltip.Content>{quiz.is_active ? 'Click to deactivate' : 'Click to activate'}</Tooltip.Content>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Chip size="sm" color={quiz.is_active ? 'success' : 'default'}>
                            {quiz.is_active ? 'Active' : 'Inactive'}
                          </Chip>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" onPress={() => handleOpenQuizDialog(quiz)} className="mr-1">
                              <Pencil size={16} />
                            </Button>
                            <Tooltip.Content>Edit</Tooltip.Content>
                          </Tooltip>
                          <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" onPress={() => handleDeleteQuiz(quiz)}>
                              <Trash2 size={16} style={{ color: '#e94560' }} />
                            </Button>
                            <Tooltip.Content>Delete</Tooltip.Content>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tabValue === 'questions' && (
          <div className="mt-4">
            <Card className="mb-3">
              <CardContent className="flex gap-3 items-center p-4">
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-[#2a2a3e] bg-[#14141f] text-[#eaeaea] text-sm focus:outline-none focus:border-[#e94560]"
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title} {quiz.is_active ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
                <Button
                  onPress={() => handleOpenQuestionDialog()}
                  isDisabled={!selectedQuizId}
                >
                  <Plus size={20} /> Add Question
                </Button>
              </CardContent>
            </Card>
            {!selectedQuizId ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-text-secondary">Select a quiz to manage questions.</p>
                </CardContent>
              </Card>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-text-secondary">No questions for this quiz. Add some to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border border-[#2a2a3e] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#14141f' }}>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Question</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm">Correct Answer</th>
                      <th className="px-4 py-3 text-right font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id} className="border-t border-[#2a2a3e] hover:bg-[rgba(233,69,96,0.04)]">
                        <td className="px-4 py-3 text-white">{question.question_text}</td>
                        <td className="px-4 py-3 text-center">
                          <Chip size="sm" color="success">{question.correct_answer}</Chip>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" onPress={() => handleOpenQuestionDialog(question)} className="mr-1">
                              <Pencil size={16} />
                            </Button>
                            <Tooltip.Content>Edit</Tooltip.Content>
                          </Tooltip>
                          <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" onPress={() => handleDeleteQuestion(question)}>
                              <Trash2 size={16} style={{ color: '#e94560' }} />
                            </Button>
                            <Tooltip.Content>Delete</Tooltip.Content>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      <Modal state={quizDialog}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <TextField value={quizDialogTitle} onChange={(v) => setQuizDialogTitle(v)}>
                <Label>Quiz Title</Label>
                <Input autoFocus />
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => quizDialog.close()}>Cancel</Button>
              <Button onPress={handleSaveQuiz}>
                {editingQuiz ? 'Update' : 'Create'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* Question Modal */}
      <Modal state={questionDialog}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{editingQuestion ? 'Edit Question' : 'New Question'}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <TextField value={questionText} onChange={(v) => setQuestionText(v)}>
                <Label>Question Text</Label>
                <Input autoFocus />
              </TextField>
              <p className="text-sm font-semibold mt-4 mb-2 text-white">Answer Options</p>
              <TextField value={option1} onChange={(v) => setOption1(v)} className="mb-2">
                <Label>Option 1</Label>
                <Input />
              </TextField>
              <TextField value={option2} onChange={(v) => setOption2(v)} className="mb-2">
                <Label>Option 2</Label>
                <Input />
              </TextField>
              <TextField value={option3} onChange={(v) => setOption3(v)} className="mb-2">
                <Label>Option 3</Label>
                <Input />
              </TextField>
              <TextField value={option4} onChange={(v) => setOption4(v)}>
                <Label>Option 4</Label>
                <Input />
              </TextField>
              <p className="text-sm font-semibold mt-4 mb-2 text-white">Correct Answer</p>
              <RadioGroup value={correctAnswer} onChange={setCorrectAnswer}>
                <Radio value={option1} isDisabled={!option1}>{option1 || 'Option 1'}</Radio>
                <Radio value={option2} isDisabled={!option2}>{option2 || 'Option 2'}</Radio>
                <Radio value={option3} isDisabled={!option3}>{option3 || 'Option 3'}</Radio>
                <Radio value={option4} isDisabled={!option4}>{option4 || 'Option 4'}</Radio>
              </RadioGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => questionDialog.close()}>Cancel</Button>
              <Button onPress={handleSaveQuestion}>
                {editingQuestion ? 'Update' : 'Create'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* Confirmation Modal */}
      <Modal state={confirmDialog}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Confirm Delete</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-white">{confirmDialogMessage}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => confirmDialog.close()}>Cancel</Button>
              <Button onPress={() => { confirmDialogAction?.(); }}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  );
}
