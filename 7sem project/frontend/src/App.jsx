import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/Dashboard';
import WebcamEmotion from './components/WebcamEmotion';
import Navbar from './components/Navbar';
import { Sparkles } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function Home() {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl flex flex-col items-center">
        {token ? (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="text-indigo-400" /> Let's analyze your mood
              </h2>
              <p className="text-slate-400">Position your face in the camera to get personalized music recommendations.</p>
            </div>
            <WebcamEmotion />
          </div>
        ) : (
          <div className="text-center my-auto max-w-2xl animate-fade-in">
            <div className="inline-block p-4 rounded-full bg-indigo-500/10 mb-6">
              <Sparkles size={48} className="text-indigo-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 mb-6 leading-tight">
              AI-Powered Mood Analysis & Music
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              MoodMuse detects your facial expressions and text sentiment to curate the perfect Spotify playlist for your current emotional state.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-indigo-500/20">
                Get Started
              </a>
              <a href="/login" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1">
                Log In
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
              <Login />
            </div>
          </div>
        } />
        <Route path="/register" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
              <Register />
            </div>
          </div>
        } />
        <Route path="/dashboard" element={
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
