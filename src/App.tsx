import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import StudentStartPage from './pages/StudentStartPage';
import QuizPage from './pages/QuizPage';
import AdminDashboard from './pages/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import SettingsPanel from './components/SettingsPanel';
import PageTransition from './components/PageTransition';
import GlobalSound from './components/GlobalSound';

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
  const { loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/start" element={<StudentStartPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <GlobalSound />
      <AppRoutes />
      {/* Floating settings gear */}
      <button
        className="fab"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
        title="Customize"
        style={{ flexDirection: 'column' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
