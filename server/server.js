const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

// array of { socket, room }
const clients = [];

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getClientRoom(socket) {
  return clients
    .filter((c) => c.socket === socket)
    .map((c) => c.room)[0] || null;
}

function countInRoom(room) {
  return clients.filter((c) => c.room === room).length;
}

function broadcastToRoom(room, message) {
  const data = JSON.stringify(message);
  for (const c of clients) {
    if (c.room === room && c.socket.readyState === 1) {
      c.socket.send(data);
    }
  }
}

function send(socket, message) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(message));
  }
}

wss.on('connection', (socket) => {
  console.log('New connection');

  socket.on('message', (raw) => {
    let parsed;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      return send(socket, { type: 'error', message: 'Invalid JSON' });
    }

    if (parsed.type === 'create') {
      const code = (parsed.payload?.room && parsed.payload.room.trim()) || generateRoomCode();
      const name = parsed.payload?.name;
      clients.push({ socket, room: code, name });
      send(socket, { type: 'created', code });
      console.log(`Room created: ${code} by ${name || 'anon'}`);
    } else if (parsed.type === 'join') {
      const room = parsed.payload?.room;
      const name = parsed.payload?.name;
      if (!room) return send(socket, { type: 'error', message: 'Room id required' });
      if (!countInRoom(room)) return send(socket, { type: 'error', message: 'Room not found' });

      clients.push({ socket, room, name });
      send(socket, { type: 'joined', room });
      broadcastToRoom(room, { type: 'user-joined', count: countInRoom(room), payload: parsed.payload });
      console.log(`Joined room: ${room}`);
    } else if (parsed.type === 'message') {
      const room = parsed.payload?.room;
      const message = parsed.payload?.message;
      const name = parsed.payload?.name;
      if (!room || !message) return send(socket, { type: 'error', message: 'room and message required' });

      broadcastToRoom(room, {
        type: 'message',
        payload: { room, message, name },
        timestamp: Date.now(),
      });
      console.log(`Message in ${room} from ${name || 'anon'}: ${message}`);
    } else {
      send(socket, { type: 'error', message: 'Unknown message type' });
    }
  });

  socket.on('close', () => {
    const i = clients.findIndex((c) => c.socket === socket);
    if (i >= 0) clients.splice(i, 1);
    console.log('Disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');
