import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Inbox, MessageCircle, Search, User, Users } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Chats from './pages/Chats.jsx';
import ChatWindow from './pages/ChatWindow.jsx';
import Connections from './pages/Connections.jsx';
import Guest from './pages/Guest.jsx';
import Landing from './pages/Landing.jsx';
import { Me, UserProfile } from './pages/Profile.jsx';
import Requests from './pages/Requests.jsx';
import SearchPage from './pages/Search.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="text-white/40 p-10">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

const BARE_ROUTES = ['/', '/guest', '/login', '/register'];

const TABS = [
  { to: '/chats', label: 'Chats', icon: MessageCircle },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/connections', label: 'People', icon: Users },
  { to: '/requests', label: 'Requests', icon: Inbox },
];

function MobileBar() {
  const { user } = useAuth();
  return (
    <nav className="md:hidden sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 pt-3 pb-3">
        <span className="font-bold text-[22px] leading-none tracking-tight drop-shadow-[0_0_18px_rgba(139,92,246,0.35)]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <span className="text-white">Gup</span><span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Shup</span>
        </span>
        <NavLink to="/me" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gradient-to-r from-violet-500/25 to-fuchsia-500/15 border border-violet-400/30 active:scale-95 transition-transform">
          <span className="relative">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">
              {(user?.name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#09090b]" />
          </span>
          <span className="text-[11px] text-white/80 font-medium truncate max-w-[110px]">@{user?.username}</span>
        </NavLink>
      </div>
      <div className="px-3 pb-3 pt-0.5 overflow-x-auto snap-x" style={{ maskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)' }}>
        <div className="flex gap-2 w-max">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `snap-start flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.45)] border border-transparent'
                  : 'text-white/60 bg-white/[0.04] border border-white/[0.08]'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </NavLink>
        ))}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-violet-500/40 via-fuchsia-500/15 to-amber-300/30" />
    </nav>
  );
}

function Shell() {
  const location = useLocation();
  const bare = BARE_ROUTES.includes(location.pathname);
  const isThread = location.pathname.startsWith('/chats/');
  if (bare) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {!isThread && <MobileBar />}
        {!isThread && <div className="h-5 md:hidden" />}
        <Routes>
          <Route path="/search" element={<Protected><SearchPage /></Protected>} />
          <Route path="/me" element={<Protected><Me /></Protected>} />
          <Route path="/u/:username" element={<Protected><UserProfile /></Protected>} />
          <Route path="/requests" element={<Protected><Requests /></Protected>} />
          <Route path="/connections" element={<Protected><Connections /></Protected>} />
          <Route path="/chats" element={<Protected><Chats /></Protected>} />
          <Route path="/chats/:id" element={<Protected><ChatWindow /></Protected>} />
          <Route path="*" element={<p className="text-white/40 p-10">Not found</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
