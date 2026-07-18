import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function JoinModal({ mode, open, onSubmit, onClose }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const nameRef = useRef(null)
  const codeRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName('')
      setCode('')
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (mode === 'join' && !code.trim()) return
    onSubmit({
      name: name.trim(),
      code: mode === 'join' ? code.trim().toUpperCase() : undefined,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative w-full max-w-sm rounded-2xl bg-[#121214] border border-white/[0.08] p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-semibold tracking-tight mb-1">
              {mode === 'create' ? 'Create a Room' : 'Enter a Room'}
            </h3>
            <p className="text-sm text-white/40 mb-6">
              {mode === 'create'
                ? 'Pick a display name to get started.'
                : 'Enter the room code and your name.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'join' && (
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Room Code</label>
                  <input
                    ref={codeRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC123"
                    maxLength={10}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Your Name</label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim() || (mode === 'join' && !code.trim())}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {mode === 'create' ? 'Create Room' : 'Join Room'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}