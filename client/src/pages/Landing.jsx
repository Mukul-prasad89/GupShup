import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, Sparkles, ArrowRight, Loader2, LogIn, Zap, ShieldCheck, Users } from 'lucide-react'
import Scene3D from '../components/Scene3D'
import ChatRoom from '../components/ChatRoom'
import JoinModal from '../components/JoinModal'

const SCRIPT = [
  { from: 'ananya', text: 'hey, is this thing live? 👀' },
  { from: 'mukul', text: 'yep — under 100ms. try it' },
  { from: 'ananya', text: 'no way. sending a room link to diya rn' },
  { from: 'mukul', text: 'no signup needed for guest rooms btw' },
  { from: 'ananya', text: 'okay this is actually fast ⚡' },
];

function DemoChat() {
  const [count, setCount] = useState(2);
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c >= SCRIPT.length) {
          setTyping(true);
          return 2;
        }
        setTyping(false);
        const n = c + 1;
        setTimeout(() => setTyping(true), 600);
        return n;
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121214]/90 backdrop-blur-xl shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </div>
        <p className="text-xs text-white/40 font-mono">room X7KQ2P · <span className="text-emerald-400">3 online</span></p>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">LIVE</span>
      </div>
      <div className="px-5 py-5 space-y-3 min-h-[280px]">
        <AnimatePresence>
          {SCRIPT.slice(0, count).map((m, i) => (
            <motion.div
              key={`${i}-${m.text}`}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.from === 'mukul' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`px-4 py-2.5 rounded-2xl text-[13px] max-w-[80%] ${m.from === 'mukul' ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-br-md' : 'bg-neutral-800 text-white rounded-bl-md'}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && count < SCRIPT.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-neutral-800 flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white/50" />
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 bg-neutral-800/80 rounded-full px-4 py-2.5">
          <span className="text-[13px] text-white/25 flex-1">Message…</span>
          <Zap className="w-3.5 h-3.5 text-violet-400" />
        </div>
      </div>
    </div>
  );
}

const STRANGER_SCRIPT = [
  { from: 'stranger', text: 'heyy! where are you from? 🎭' },
  { from: 'you', text: 'delhi! you?' },
  { from: 'stranger', text: 'mumbai 🌊 love your vibe btw' },
  { from: 'you', text: 'haha thanks! so what brings you here' },
];

function StrangerFace() {
  const [count, setCount] = useState(2);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c >= STRANGER_SCRIPT.length ? 1 : c + 1)), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-full max-w-sm rounded-3xl border border-amber-400/20 bg-[#141210]/95 backdrop-blur-xl shadow-[0_0_80px_rgba(251,191,36,0.12)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
        <span className="text-lg">🎭</span>
        <p className="text-xs text-white/50">Talk to strangers · <span className="text-amber-300">anonymous</span></p>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">RANDOM</span>
      </div>
      <div className="px-5 py-5 space-y-3 min-h-[280px]">
        <AnimatePresence>
          {STRANGER_SCRIPT.slice(0, count).map((m, i) => (
            <motion.div
              key={`${i}-${m.text}`}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`px-4 py-2.5 rounded-2xl text-[13px] max-w-[80%] ${m.from === 'you' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black rounded-br-md font-medium' : 'bg-neutral-800 text-white rounded-bl-md'}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <div className="flex-1 flex items-center bg-neutral-800/80 rounded-full px-4 py-2.5">
          <span className="text-[13px] text-white/25">Say hi…</span>
        </div>
        <div className="px-4 py-2.5 rounded-full border border-white/15 text-[13px] font-semibold">Next ⏭</div>
      </div>
    </div>
  );
}

function CardStack() {
  const [active, setActive] = useState(0);
  // Auto-swap faces every 5s (useEffect rotation).
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 2), 5000);
    return () => clearInterval(t);
  }, []);
  const faces = [
    { key: 'rooms', label: 'Guest rooms', node: <DemoChat /> },
    { key: 'strangers', label: 'Talk to strangers', node: <StrangerFace /> },
  ];
  const next = faces[(active + 1) % faces.length];
  return (
    <div className="relative w-full max-w-[320px] h-[400px]">
      {/* behind card: slanted, peeking, showing what's next */}
      <div className="absolute inset-0 translate-x-6 translate-y-6 rotate-[5deg] scale-[0.96] opacity-60 pointer-events-none" aria-hidden>
        {next.node}
      </div>
      <div className="absolute inset-0 -translate-x-4 translate-y-2 -rotate-[4deg] scale-[0.98] opacity-40 pointer-events-none" aria-hidden>
        {faces[active].node}
      </div>
      {/* floating front card: drops from top on every swap */}
      <AnimatePresence mode="wait">
        <motion.div
          key={faces[active].key}
          initial={{ y: -160, opacity: 0, rotate: -3 }}
          animate={{ y: [0, -10, 0], opacity: 1, rotate: 0 }}
          exit={{ y: 120, opacity: 0, rotate: 2 }}
          transition={{ duration: 0.55, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {faces[active].node}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {/* slide dots */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {faces.map((f, i) => (
          <button
            key={f.key}
            onClick={() => setActive(i)}
            aria-label={f.label}
            className={`rounded-full transition-all duration-300 ${
              i === active ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/25 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  { n: '01', title: 'Create', desc: 'One click spins up a private room with a shareable 6-letter code.' },
  { n: '02', title: 'Share', desc: 'Send the code or link. Friends join from any device, no install.' },
  { n: '03', title: 'Talk', desc: 'Messages land in milliseconds. Sign up later for persistent DMs.' },
];

const features = [
  {
    icon: '⚡',
    title: 'Instant Delivery',
    desc: 'Messages arrive in milliseconds. Zero lag, pure conversation flow.',
  },
  {
    icon: '🔒',
    title: 'Private Rooms',
    desc: 'Create invite-only spaces. Your conversations, your rules.',
  },
  {
    icon: '🌐',
    title: 'Real-time Sync',
    desc: 'Every participant sees updates the moment they happen.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function App() {
  const [hovered, setHovered] = useState(null)
  const [room, setRoom] = useState(null)
  const [name, setName] = useState(null)
  const [creating, setCreating] = useState(false)
  const [modalMode, setModalMode] = useState(null)
  const [isNewRoom, setIsNewRoom] = useState(false)

  const handleCreate = ({ name }) => {
    setCreating(true)
    setModalMode(null)
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      setName(name)
      setRoom(code)
      setIsNewRoom(true)
      setCreating(false)
    }, 500)
  }

  const handleJoin = ({ name, code }) => {
    setName(name)
    setRoom(code)
    setIsNewRoom(false)
    setModalMode(null)
  }

  if (room) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={room}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <ChatRoom room={room} name={name} isNewRoom={isNewRoom} onLeave={() => { setRoom(null); setName(null); setIsNewRoom(false) }} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen text-white selection:bg-white/20">
      <Scene3D />

      {/* --- NAVBAR --- */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.06]"
      >
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <a href="/" className="-ml-2 font-bold text-3xl leading-none tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="text-white">Gup</span><span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Shup</span>
          </a>
          <div className="hidden md:flex items-center gap-2 text-[13px] font-medium">
            <a href="/login" className="px-5 py-2 rounded-full border border-violet-400/50 font-bold text-violet-200 hover:bg-violet-500 hover:border-violet-500 hover:text-white transition-all">Login</a>
            <a href="/register" className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_32px_rgba(139,92,246,0.55)] hover:scale-[1.03] transition-all">Sign up</a>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <a href="/login" className="px-4 py-1.5 rounded-full border border-violet-400/50 text-[13px] font-bold text-violet-200">Login</a>
            <a href="/register" className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[13px] font-semibold">Sign up</a>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO --- */}
      <section className="relative z-10 min-h-screen flex items-center px-6 pt-[68px]">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-3xl text-center lg:text-left"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-white/60 mb-5 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Feeling bored? 👀 someone's online
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.02] mb-4"
          >
            Feeling bored?
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Talk to someone.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-sm sm:text-[15px] text-white/40 max-w-md mx-auto lg:mx-0 leading-relaxed mb-6"
          >
            Lots of <span className="text-violet-300 font-semibold">profiles</span> waiting to chat.
            Or spin up a <span className="text-violet-300 font-semibold">chatroom</span>, share it with
            your <span className="text-violet-300 font-semibold">friends</span>, and collab through{' '}
            <span className="text-violet-300 font-semibold">hackathons</span> and late-night builds.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <motion.a
              href="/register"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHovered('start')}
              onMouseLeave={() => setHovered(null)}
              className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-[13px] transition-all duration-300 shadow-[0_0_32px_rgba(139,92,246,0.35)] hover:shadow-[0_0_44px_rgba(139,92,246,0.55)] cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Start Chat
              <ArrowRight
                className={`w-4 h-4 transition-transform duration-300 ${hovered === 'start' ? 'translate-x-1' : ''}`}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.a>
          </motion.div>
          <motion.div variants={fadeUp} custom={5} className="mt-8">
            <div className="flex items-center gap-3 max-w-md mb-4">
              <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-white/20" />
              <span className="text-[11px] uppercase tracking-widest text-white/30">or</span>
              <span className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-white/20" />
            </div>
            <p className="text-sm text-white/45 mb-3 text-center lg:text-left">
              Want to create <span className="text-violet-300 font-semibold">chat rooms</span>? Here is for you 👇
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModalMode('create')}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white text-black font-semibold text-[13px] hover:shadow-[0_0_32px_rgba(255,255,255,0.15)] transition-all cursor-pointer disabled:opacity-60"
            >
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                <><MessageSquarePlus className="w-4 h-4" /> Create a Chatroom</>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModalMode('join')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-white/15 bg-white/[0.04] text-white font-semibold text-[13px] hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Enter a Room
            </motion.button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
          className="hidden lg:flex justify-center relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-tr from-violet-600/20 via-transparent to-indigo-500/10 blur-3xl pointer-events-none" />
          <CardStack />
        </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1 rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </section>

      <JoinModal
        mode={modalMode}
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        onSubmit={modalMode === 'create' ? handleCreate : handleJoin}
      />

      {/* --- HOW IT WORKS --- */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="flex items-end justify-between mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em]">
              Live in 10 seconds.
            </h2>
            <span className="text-xs text-white/30 hidden sm:inline">no install · no signup for guests</span>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                className="relative p-8 rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden"
              >
                <span className="text-6xl font-bold text-white/[0.06] absolute top-4 right-6">{s.n}</span>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TWO WAYS --- */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          <motion.a
            href="/guest"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] transition-all block"
          >
            <Zap className="w-6 h-6 text-amber-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Guest rooms ⚡</h3>
            <p className="text-sm text-white/40 leading-relaxed mb-4">Ephemeral 6-letter rooms. Link it, talk, disappear. Nothing stored.</p>
            <span className="text-sm font-semibold">Try instantly →</span>
          </motion.a>
          <motion.a
            href="/register"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl border border-violet-500/25 bg-gradient-to-b from-violet-600/[0.12] to-transparent hover:border-violet-400/40 transition-all block"
          >
            <ShieldCheck className="w-6 h-6 text-violet-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Social DMs 🔒</h3>
            <p className="text-sm text-white/40 leading-relaxed mb-4">Profiles, follow requests, persistent 1-to-1 chats with history.</p>
            <span className="text-sm font-semibold text-violet-200">Create free account →</span>
          </motion.a>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em]">
              Built for speed.
              <br />
              <span className="text-white/40">Designed for humans.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="text-3xl mb-5">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-white/20">GupShup</span>
          <span className="text-xs text-white/20">Designed &amp; Developed by Mukul Prasad</span>
        </div>
      </footer>
    </div>
  )
}