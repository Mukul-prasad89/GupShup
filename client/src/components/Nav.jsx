import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl tracking-tight">GupShup</Link>
        <div className="flex items-center gap-4 text-sm text-white/70">
          {user ? (
            <>
              <Link to="/search" className="hover:text-white">Search</Link>
              <Link to="/requests" className="hover:text-white">Requests</Link>
              <Link to="/connections" className="hover:text-white">People</Link>
              <Link to="/chats" className="hover:text-white">Chats</Link>
              <Link to="/me" className="hover:text-white">@{user.username}</Link>
              <button
                onClick={async () => { await logout(); navigate('/'); }}
                className="px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/guest" className="hover:text-white">Guest rooms</Link>
              <Link to="/login" className="hover:text-white">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
