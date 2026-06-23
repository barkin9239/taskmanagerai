import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
          T
        </div>
        <span className="font-semibold text-gray-800">TaskManager AI</span>
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome,{' '}
          <span className="font-medium text-gray-900">{user?.name ?? 'User'}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
