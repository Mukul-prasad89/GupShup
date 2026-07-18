import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, Sparkles, ArrowRight, Loader2, LogIn } from 'lucide-react'
import Scene3D from './components/Scene3D'
import ChatRoom from './components/ChatRoom'
import JoinModal from './components/JoinModal'

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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg tracking-tight">GupShup</span>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO --- */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-white/60 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Real-time conversations, reimagined
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.95] mb-6"
          >
            Where words
            <br />
            <span className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
              come alive
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base sm:text-lg text-white/40 max-w-lg mx-auto leading-relaxed mb-12"
          >
            Create a chatroom in one click. Share the link. Start talking.
            No sign-ups, no friction — just pure, instant connection.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHovered('create')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setModalMode('create')}
              disabled={creating}
              className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4.5 h-4.5" />
                  Create Chatroom
                  <ArrowRight
                    className={`w-4 h-4 transition-transform duration-300 ${hovered === 'create' ? 'translate-x-1' : ''}`}
                  />
                </>
              )}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHovered('join')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setModalMode('join')}
              className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border border-white/15 bg-white/[0.04] text-white font-semibold text-sm transition-all duration-300 hover:bg-white/[0.08] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Enter a Room
            </motion.button>

            <span className="text-xs text-white/30 tracking-wide uppercase">No account needed</span>
          </motion.div>
        </motion.div>

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
          <span className="text-xs text-white/20">Built with care</span>
        </div>
      </footer>
    </div>
  )
}