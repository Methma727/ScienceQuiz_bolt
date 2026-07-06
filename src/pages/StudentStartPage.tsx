import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent, TextField, Label, FieldError } from '@heroui/react';
import { useApp } from '../context/AppContext';
import { NotebookText } from 'lucide-react';

export default function StudentStartPage() {
  const navigate = useNavigate();
  const { studentName, setStudentName } = useApp();
  const [name, setName] = useState(studentName || '');
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setStudentName(trimmedName);
    navigate('/quiz');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-bg-default p-4">
      <Card className="max-w-[420px] w-full">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <NotebookText className="mx-auto mb-2" size={48} style={{ color: '#e94560' }} />
            <h2 className="text-2xl font-semibold" style={{ color: '#eaeaea' }}>Ready to Quiz?</h2>
            <p className="text-sm text-text-secondary">Enter your name to begin</p>
          </div>

          <div>
            <TextField value={name} onChange={(v) => { setName(v); setError(null); }} isInvalid={!!error} className="mb-4">
              <Label>Your Name</Label>
              <Input
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStart();
                  }
                }}
              />
              {error && <FieldError>{error}</FieldError>}
            </TextField>
            <Button
              fullWidth
              size="lg"
              onPress={handleStart}
            >
              Start Quiz
            </Button>
            <Button
              fullWidth
              variant="ghost"
              size="sm"
              onPress={() => navigate('/leaderboard')}
              className="mt-3"
            >
              View Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
