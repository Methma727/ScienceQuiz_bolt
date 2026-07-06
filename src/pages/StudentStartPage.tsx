import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import QuizIcon from '@mui/icons-material/Quiz';

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
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <QuizIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" color="primary" gutterBottom>
              Ready to Quiz?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your name to begin
            </Typography>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              error={!!error}
              helperText={error}
              sx={{ mb: 3 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleStart();
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleStart}
              sx={{ py: 1.5 }}
            >
              Start Quiz
            </Button>
            <Button
              fullWidth
              variant="text"
              size="small"
              onClick={() => navigate('/leaderboard')}
              sx={{ mt: 2 }}
            >
              View Leaderboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
