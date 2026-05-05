import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link 
        to="/" 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${mobile ? 'w-full' : ''}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <Activity size={18} /> Home
      </Link>
      <Link 
        to="/dashboard" 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${mobile ? 'w-full' : ''}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <LayoutDashboard size={18} /> Dashboard
      </Link>
      {/* Profile is a placeholder for now */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 cursor-not-allowed ${mobile ? 'w-full' : ''}`}>
        <User size={18} /> Profile
      </div>
      <button 
        onClick={() => {
          handleLogout();
          if (mobile) setIsMobileMenuOpen(false);
        }} 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors ${mobile ? 'w-full justify-start' : ''}`}
      >
        <LogOut size={18} /> Logout
      </button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Activity className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                MoodMuse
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          {token ? (
            <div className="hidden md:flex items-center gap-2">
              <NavLinks />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium">Login</Link>
              <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {token ? (
              <NavLinks mobile={true} />
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-indigo-500 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
