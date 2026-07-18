import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'

export default function ChatRoom({ room, name, onLeave, isNewRoom = false }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [online, setOnline] = useState(1)
  const WS_URL = import.meta.env.VITE_WS_URL || 'wss://gupshup-ou0n.onrender.com'
  const wsRef = useRef(null)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      // create new room OR join existing
      const type = isNewRoom ? 'create' : 'join'
      ws.send(JSON.stringify({
        type,
        payload: { room, name },
      }))
    }

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'message') {
        setMessages((m) => [...m, {
          text: data.payload.message,
          sender: data.payload.name,
          mine: data.payload.name === name,
          ts: data.timestamp,
        }])
      } else if (data.type === 'user-joined') {
        setOnline(data.count || 1)
        setMessages((m) => [...m, {
          system: true,
          text: `${data.payload?.name || 'Someone'} joined · ${data.count} online`,
          ts: Date.now(),
        }])
      } else if (data.type === 'joined') {
        setMessages((m) => [...m, { system: true, text: `Joined room ${room}`, ts: Date.now() }])
      } else if (data.type === 'created') {
        setMessages((m) => [...m, { system: true, text: `Room ${room} created`, ts: Date.now() }])
      } else if (data.type === 'error') {
        setMessages((m) => [...m, { system: true, error: true, text: data.message, ts: Date.now() }])
      }
    }

    ws.onclose = () => console.log('ws closed')
    return () => ws.close()
  }, [room, name, isNewRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [])

  const handleSend = () => {
    const text = input.trim()
    if (!text || !wsRef.current || wsRef.current.readyState !== 1) return
    wsRef.current.send(JSON.stringify({
      type: 'message',
      payload: { room, message: text, name },
    }))
    // do NOT add message locally — server broadcasts to everyone (incl. us)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#09090b]/80 backdrop-blur z-10">
        <button onClick={onLeave} className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm text-white/60 hidden sm:inline">Leave</span>
        </button>

        {/* room code in middle, boxed */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-white/15 bg-white/[0.05]">
          <span className="text-xs text-white/40">Room</span>
          <span className="font-mono font-semibold text-sm tracking-wider">{room}</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-xs text-white/40">{online} online</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
            {name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-white/60 hidden sm:inline">{name}</span>
        </div>
      </header>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl w-full mx-auto flex flex-col">
        <div className="flex-1" />
        <div className="space-y-3">
          {messages.map((m, i) =>
          m.system ? (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center text-xs ${m.error ? 'text-red-400' : 'text-white/40'}`}
            >
              {m.text}
            </motion.div>
          ) : (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {!m.mine && (
                  <span className="text-xs text-white/40 mb-1 ml-1">{m.sender}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    m.mine
                      ? 'bg-white text-black rounded-br-md'
                      : 'bg-neutral-800 text-white rounded-bl-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </motion.div>
          )
        )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="border-t border-white/10 px-6 py-4 pb-6 bg-[#09090b]/80 backdrop-blur">
        <div className="max-w-3xl mx-auto flex items-center gap-3 bg-neutral-800 rounded-2xl px-4 py-2.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${room}...`}
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
            autoFocus
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-40"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}