const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = require('./app');

// Allow frontend to connect
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with WebSocket and CORS settings
const io = socketIo(server, {
  transports: ['websocket'],

  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true,
  },

});

// Simple in-memory rate limiting
io.use((socket, next) => {
  const MAX_REQUESTS = 100;
  const INTERVAL = 60000; // 1 minute

  if (!socket.rateLimit) {
    socket.rateLimit = {
      count: 0,
      lastReset: Date.now()
    };
  }

  const now = Date.now();
  const timePassed = now - socket.rateLimit.lastReset;

  if (timePassed > INTERVAL) {
    socket.rateLimit.count = 0;
    socket.rateLimit.lastReset = now;
  }

  if (socket.rateLimit.count++ > MAX_REQUESTS) {
    console.warn(`⚠️ [RATE LIMIT] Exceeded for socket ${socket.id}`);
    return next(new Error('Rate limit exceeded'));
  }

  next();
});

// Maps for email to socketId and vice versa
const emailToSocket = {};
const socketToEmail = {};

io.on('connection', (socket) => {
  console.log(`🔌 [CONNECTED] Socket ID: ${socket.id}`);

  socket.onAny((event, ...args) => {
    console.log(`📨 [EVENT] ${event}`, args);
  });

  // Register a user with their email
  socket.on("registerUser", (email, callback) => {
    if (!email) {
      console.warn(`⚠️ [REGISTER] Empty email. Socket: ${socket.id}`);
      if (callback) callback({ success: false, error: 'Email is required' });
      return;
    }

    if (emailToSocket[email]) {
      const oldSocketId = emailToSocket[email];
      delete socketToEmail[oldSocketId];
    }

    emailToSocket[email] = socket.id;
    socketToEmail[socket.id] = email;
    console.log(`✅ [REGISTER] ${email} → ${socket.id}`);

    io.emit('allUsers', emailToSocket);
    if (callback) callback({ success: true });
  });

  // Manual logout
  socket.on("logout", () => {
    const email = socketToEmail[socket.id];
    if (email) {
      console.log(`👋 [LOGOUT] ${email}`);
      delete emailToSocket[email];
      delete socketToEmail[socket.id];
      io.emit('allUsers', emailToSocket);
    }
  });

  // Send list of all registered users
  socket.on('requestUsers', (callback) => {
    console.log(`📤 [USER LIST] Sent to ${socket.id}`);
    if (callback) callback(emailToSocket);
    else socket.emit('allUsers', emailToSocket);
  });

  // Handle incoming call
  socket.on('callUser', ({ userToCall, email, signalData, from }, callback) => {
    try {
      const target = userToCall || email; // ✅ Accept either
      const targetSocketId = emailToSocket[target];
  
      if (!targetSocketId) throw new Error("User not found");
  
      console.log(`📞 [CALL] From ${from} to ${target} (${targetSocketId})`);
      io.to(targetSocketId).emit('incomingCall', { signalData, from });
  
      if (callback) callback({ success: true });
    } catch (error) {
      console.warn(`❌ [CALL FAILED] ${error.message}`);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });
  

  // Handle call acceptance
  socket.on('acceptCall', ({ to, signal }, callback) => {
    try {
      console.log(`✅ [CALL ACCEPTED] To: ${to}`);
      io.to(to).emit('callAccepted', signal);
      if (callback) callback({ success: true });
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
    }
  });

  socket.on("reject-call", ({ to }) => {
    io.to(to).emit("call-rejected");
  });
  

  // Handle socket disconnect
  socket.on('disconnect', () => {
    const email = socketToEmail[socket.id];
    if (email) {
      console.log(`❌ [DISCONNECTED] ${email} (${socket.id})`);
      delete emailToSocket[email];
      delete socketToEmail[socket.id];
      io.emit('allUsers', emailToSocket);
    } else {
      console.log(`👋 [DISCONNECTED UNKNOWN] Socket ID: ${socket.id}`);
    }
  });
});

// Debug endpoint to check current connections
app.get('/socket-debug', (req, res) => {
  res.json({
    connections: {
      total: io.engine.clientsCount,
      registered: Object.keys(emailToSocket).length
    },
    registeredUsers: Object.keys(emailToSocket)
  });
});

// Graceful shutdown support
process.on('SIGTERM', () => {
  console.log('🛑 [SHUTDOWN] Closing server gracefully...');
  io.emit('serverShutdown', { message: 'Server is restarting, please reconnect soon' });
  io.close(() => {
    server.close(() => {
      console.log('✅ [SHUTDOWN] Server closed gracefully');
      process.exit(0);
    });
  });
});

// Start the server
server.listen(5500, () => {
  console.log('🚀 Server running at http://localhost:5500');
});
