import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MiniJurisPilot from './components/ai/MiniJurisPilot';
import ScrollProgress from './components/common/ScrollProgress';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterLawyer from './pages/RegisterLawyer';
import LawyerMarketplace from './pages/LawyerMarketplace';
import LawyerProfile from './pages/LawyerProfile';

// User Pages
import Dashboard from './pages/Dashboard';
import JurisPilotChat from './pages/JurisPilotChat';
import MyCases from './pages/MyCases';
import CaseDetail from './pages/CaseDetail';
import CreateCase from './pages/CreateCase';
import MyDocuments from './pages/MyDocuments';
import LegalNotices from './pages/LegalNotices';
import CreateNotice from './pages/CreateNotice';
import ChatRoom from './pages/ChatRoom';
import VideoCall from './pages/VideoCall';

// Lawyer Pages
import LawyerDashboard from './pages/LawyerDashboard';
import LawyerRequests from './pages/LawyerRequests';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { token } = useAuthStore();
  const { darkMode } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#1A2236' : '#0D1B2A',
            color: '#fff',
            borderRadius: '10px',
            border: darkMode ? '1px solid #1E293B' : 'none',
          },
        }}
      />

      <ScrollProgress />

      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/register/lawyer" element={token ? <Navigate to="/dashboard" /> : <RegisterLawyer />} />
            <Route path="/lawyers" element={<LawyerMarketplace />} />
            <Route path="/lawyers/:id" element={<LawyerProfile />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/jurispilot" element={<ProtectedRoute><JurisPilotChat /></ProtectedRoute>} />
            <Route path="/chat/:caseId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            <Route path="/video/:caseId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><MyCases /></ProtectedRoute>} />
            <Route path="/cases/new" element={<ProtectedRoute roles={['user']}><CreateCase /></ProtectedRoute>} />
            <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
            <Route path="/notices" element={<ProtectedRoute><LegalNotices /></ProtectedRoute>} />
            <Route path="/notices/new" element={<ProtectedRoute><CreateNotice /></ProtectedRoute>} />
            <Route path="/lawyer/dashboard" element={<ProtectedRoute roles={['lawyer']}><LawyerDashboard /></ProtectedRoute>} />
            <Route path="/lawyer/requests" element={<ProtectedRoute roles={['lawyer']}><LawyerRequests /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                    <i className="fas fa-compass text-2xl" style={{ color: 'var(--text-secondary)' }}></i>
                  </div>
                  <h1 className="text-5xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>404</h1>
                  <p className="text-lg mt-3" style={{ color: 'var(--text-secondary)' }}>Page not found</p>
                  <a href="/" className="btn-primary mt-6 inline-flex"><i className="fas fa-home text-xs"></i>Back to Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>

        {token && <MiniJurisPilot />}
        <Footer />
      </div>
    </Router>
  );
}

export default App;