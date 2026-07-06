import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent, Spinner, Alert, TextField, Label } from '@heroui/react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../lib/constants';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && isAdmin) {
    navigate('/admin', { replace: true });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message);
      setLoading(false);
      return;
    }

    if (email === ADMIN_EMAIL) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/start', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-bg-default p-4">
      <Card className="max-w-[420px] w-full">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <GraduationCap className="mx-auto mb-2" size={48} style={{ color: '#1a1a2e' }} />
            <h2 className="text-2xl font-semibold" style={{ color: '#1a1a2e' }}>Quiz App</h2>
            <p className="text-sm text-text-secondary">Sign in to continue</p>
          </div>

          {error && (
            <Alert status="danger" className="mb-3">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <TextField value={email} onChange={(v) => setEmail(v)} isDisabled={loading}>
                <Label>Email</Label>
                <Input type="email" />
              </TextField>
            </div>
            <div className="mb-4">
              <TextField value={password} onChange={(v) => setPassword(v)} isDisabled={loading}>
                <Label>Password</Label>
                <Input type="password" />
              </TextField>
            </div>
            <Button
              fullWidth
              type="submit"
              size="lg"
              isDisabled={loading}
              className="py-4"
            >
              {loading ? <Spinner size="sm" color="current" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
