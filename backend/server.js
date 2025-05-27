const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = require('./app'); // Your Express app

// Allow frontend to connect
app.use(cors({
  origin: 'http://localhost:8080', // Adjust if needed
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with WebSocket only and CORS
const io = socketIo(server, {
  transports: ['websocket'],
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

// Maps for email to socketId and vice versa
const emailToSocket = {};
const socketToEmail = {};

io.on('connection', (socket) => {
  console.log(`🔌 [CONNECTED] Socket ID: ${socket.id}`);


  socket.on("registerUser", (email) => {
    if (!email) {
      console.warn(`⚠️ [REGISTER] Empty email. Socket: ${socket.id}`);
      return;
    }

    emailToSocket[email] = socket.id;
    socketToEmail[socket.id] = email;
    console.log(`✅ [REGISTER] ${email} → ${socket.id}`);

    // Broadcast updated user list
    io.emit('allUsers', emailToSocket);
  });

  // Manual logout (if frontend emits it)
  socket.on("logout", () => {
    const email = socketToEmail[socket.id];
    if (email) {
      console.log(`👋 [LOGOUT] ${email}`);
      delete emailToSocket[email];
      delete socketToEmail[socket.id];
      io.emit('allUsers', emailToSocket);
    }
  });

  // Client requests user list
  socket.on('requestUsers', () => {
    console.log(`📤 [USER LIST] Sent to ${socket.id}`);
    socket.emit('allUsers', emailToSocket);
  });

  // Handle user call by email
  socket.on('callUserByEmail', ({ email, signalData, from }) => {
    const targetSocketId = emailToSocket[email];
    if (targetSocketId) {
      console.log(`📞 [CALL] From ${from} to ${email} (${targetSocketId})`);
      io.to(targetSocketId).emit('incomingCall', { signalData, from });
    } else {
      console.warn(`❌ [CALL FAILED] No socket for ${email}`);
    }
  });

  // Handle call acceptance
  socket.on('acceptCall', ({ to, signal }) => {
    console.log(`✅ [CALL ACCEPTED] To: ${to}`);
    io.to(to).emit('callAccepted', signal);
  });

  // Optional: ping-pong to keep alive
  socket.on('ping', () => {
    console.log(`🏓 [PING] From ${socket.id}`);
    socket.emit('pong');
  });

  // Disconnect cleanup
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

// Start server
server.listen(5500, () => {
  console.log('🚀 Server running at http://localhost:5500');
});
