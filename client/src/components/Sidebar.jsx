import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Inbox, LogOut, MessageCircle, Search, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ITEMS = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/requests', label: 'Requests', icon: Inbox },
  { to: '/connections', label: 'People', icon: Users },
  { to: '/chats', label: 'Chats', icon: MessageCircle },
  { to: '/me', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="w-60 shrink-0 min-h-screen sticky top-0 h-screen border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 hidden md:flex flex-col">
      <Link to="/chats" className="font-bold text-2xl tracking-tight px-2 mb-8">GupShup</Link>
      <nav className="space-y-1 flex-1">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-4 border-t border-white/[0.06]">
        <p className="text-xs text-white/40 px-3 mb-3 truncate">@{user?.username}</p>
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
