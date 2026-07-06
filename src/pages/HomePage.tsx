import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAdmin } = useApp();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(233, 69, 96, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <SchoolIcon sx={{ fontSize: 72, color: 'secondary.main', mb: 2 }} />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 50%, #e94560 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            QuizMaster
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Challenge yourself. Climb the ranks.
          </Typography>
        </Box>

        {/* Welcome Button */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(isAdmin ? '/admin' : '/start')}
          sx={{
            py: 2,
            px: 6,
            fontSize: '1.25rem',
            borderRadius: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
            boxShadow: '0 8px 32px rgba(233, 69, 96, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #c73e54 0%, #e94560 100%)',
              boxShadow: '0 12px 40px rgba(233, 69, 96, 0.5)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isAdmin ? 'Go to Dashboard' : 'Get Started'}
        </Button>

        {/* Secondary Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<QuizIcon />}
            onClick={() => navigate('/main')}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: '#2a2a3e',
              '&:hover': {
                borderColor: 'secondary.main',
              },
            }}
          >
            View Quizzes
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<EmojiEventsIcon />}
            onClick={() => navigate('/main')}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: '#2a2a3e',
              '&:hover': {
                borderColor: 'secondary.main',
              },
            }}
          >
            Leaderboard
          </Button>
        </Box>

        {/* Admin Link */}
        <Box sx={{ mt: 6 }}>
          <Button
            variant="text"
            size="small"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => navigate('/login')}
            sx={{ color: 'text.secondary', opacity: 0.7 }}
          >
            Admin Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
