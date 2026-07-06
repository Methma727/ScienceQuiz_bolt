import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { useApp } from '../context/AppContext';
import { GraduationCap, NotebookText, Trophy, Shield } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAdmin } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-bg-default relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(233, 69, 96, 0.15) 0%, transparent 70%)' }}
      />

      <div className="max-w-sm w-full text-center relative z-10 px-4">
        <div className="mb-8">
          <GraduationCap className="mx-auto mb-4" size={72} style={{ color: '#e94560' }} />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 50%, #e94560 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            QuizMaster
          </h1>
          <p className="text-text-secondary text-lg font-normal">
            Challenge yourself. Climb the ranks.
          </p>
        </div>

        <Button
          size="lg"
          onPress={() => navigate(isAdmin ? '/admin' : '/start')}
          className="w-full py-6 mb-6 text-lg font-semibold border-none"
          style={{
            background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
            boxShadow: '0 8px 32px rgba(233, 69, 96, 0.4)',
            color: 'white',
          }}
        >
          {isAdmin ? 'Go to Dashboard' : 'Get Started'}
        </Button>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            variant="outline"
            size="lg"
            onPress={() => navigate('/main')}
            className="px-6"
            style={{ borderColor: '#2a2a3e', color: '#eaeaea' }}
          >
            <NotebookText size={20} /> View Quizzes
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => navigate('/main')}
            className="px-6"
            style={{ borderColor: '#2a2a3e', color: '#eaeaea' }}
          >
            <Trophy size={20} /> Leaderboard
          </Button>
        </div>

        <div className="mt-12">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate('/login')}
            className="text-text-secondary opacity-70"
          >
            <Shield size={16} /> Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
}
