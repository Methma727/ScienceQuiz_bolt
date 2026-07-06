import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import StudentStartPage from './pages/StudentStartPage';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboard from './pages/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';

function ProtectedAdminRoute() {
  const { isAdmin, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
}

function AppRoutes() {
  const { user, isAdmin, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/start" element={<StudentStartPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/admin" element={<ProtectedAdminRoute />} />
      <Route
        path="/"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : user ? (
            <Navigate to="/leaderboard" replace />
          ) : (
            <Navigate to="/leaderboard" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
