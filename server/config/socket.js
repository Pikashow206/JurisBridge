const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
        return callback(new Error('CORS blocked'), false);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Chat events ──
    socket.on('join_case', (caseId) => {
      socket.join(`case_${caseId}`);
      console.log(`📂 User joined case room: case_${caseId}`);
    });

    socket.on('leave_case', (caseId) => {
      socket.leave(`case_${caseId}`);
      console.log(`📂 User left case room: case_${caseId}`);
    });

    socket.on('send_message', (data) => {
      io.to(`case_${data.caseId}`).emit('receive_message', data);
    });

    socket.on('typing', (data) => {
      socket.to(`case_${data.caseId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('join_ai_room', (userId) => {
      socket.join(`ai_${userId}`);
      console.log(`🤖 User joined JurisPilot room: ai_${userId}`);
    });

    // ── Video call signaling ──
    socket.on('join_video', (caseId) => {
      socket.join(`video_${caseId}`);
      socket.to(`video_${caseId}`).emit('user_joined_video', socket.id);
      console.log(`📹 User ${socket.id} joined video room: video_${caseId}`);
    });

    socket.on('leave_video', (caseId) => {
      socket.to(`video_${caseId}`).emit('user_left_video', socket.id);
      socket.leave(`video_${caseId}`);
      console.log(`📹 User ${socket.id} left video room: video_${caseId}`);
    });

    socket.on('video_offer', ({ caseId, offer }) => {
      socket.to(`video_${caseId}`).emit('video_offer', { offer, from: socket.id });
    });

    socket.on('video_answer', ({ caseId, answer }) => {
      socket.to(`video_${caseId}`).emit('video_answer', { answer, from: socket.id });
    });

    socket.on('ice_candidate', ({ caseId, candidate }) => {
      socket.to(`video_${caseId}`).emit('ice_candidate', { candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized! Call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };