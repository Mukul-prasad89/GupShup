import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import Search from './pages/Search.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="text-white/40 p-10">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

const BARE_ROUTES = ['/', '/guest', '/login', '/register'];

function Shell() {
  const location = useLocation();
  const bare = BARE_ROUTES.includes(location.pathname);
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
        <nav className="md:hidden sticky top-0 z-40 flex items-center gap-4 px-4 py-3 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur text-sm text-white/70 overflow-x-auto">
          <span className="font-bold text-white mr-2">GupShup</span>
          <a href="/search">Search</a>
          <a href="/requests">Requests</a>
          <a href="/connections">People</a>
          <a href="/chats">Chats</a>
          <a href="/me">Profile</a>
        </nav>
        <Routes>
          <Route path="/search" element={<Protected><Search /></Protected>} />
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
