// // const app=require('./app')

// // const express = require('express');
// // const http = require('http');  // needed to create raw server
// // const bodyParser = require('body-parser');
// // const { Server } = require('socket.io');  // correct import

// // const server = http.createServer(app);   

// // const io = new Server(server, {
// //     cors: {
// //       origin: 'http://localhost:8080', // Update this to your frontend port
// //       methods: ['GET', 'POST'],
// //       allowedHeaders: ['Content-Type'],
// //       credentials: true, // Allow credentials if you're using cookies or authentication
// //     },
// //     transports: ['websocket', 'polling'], // Allow WebSocket transport
// //   });
 
          


// // const emailToSocket = new Map();
// // const users={}

  
// // io.on('connection', (socket) => {
// //   if(!users[socket.id]){
// //     users[socket.id]=socket.id;
// //   }

// //   socket.emit("yourId",socket.id);
// //   io.sockets.emit('allUsers',users);
// //   socket.on('disconnect',()=>{
// //     delete users[socket.id];
// //   })
// //   socket.on("callUser",(data)=>{
// //     io.to(data.userToCall).emit('hey',{signal:data.signalData,from:data.from});
// //   })

// //   socket.on('acceptCall',(data)=>{
// //     io.to(data.to).emit('callAccepted',data.signal);
// //   })



  
// // });

// // // Use a single port
// // server.listen(5500, () => {
// //   console.log('Server running on port 5500');
// // });


// const e = require('cors');
// const app = require('./app');
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:8080',
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type'],
//     credentials: true,
//   },
//   transports: ['websocket', 'polling'],
// });

// const emailToSocket = new Map();
// const users = {};

// io.on('connection', (socket) => {
//   console.log(`🔌 User connected: ${socket.id}`);

//   // Optional: Track all socket IDs
//   if (!users[socket.id]) {
//     users[socket.id] = socket.id;
//   }

//   // Emit your ID to client
//   socket.emit('yourId', socket.id);
  
//   // Emit all users list
//   io.sockets.emit('allUsers', Object.fromEntries(emailToSocket));

  
//   // Listen for email registration
//   socket.on('registerEmail', (email) => {
//     console.log(`✅ Registering email: ${email} with socket: ${socket.id}`);
//     emailToSocket.set(email, socket.id);
//   });
  
//   console.log(emailToSocket);
//   // Call user by email
//   socket.on('callUserByEmail', ({ email, signalData, from }) => {
//     const targetSocketId = emailToSocket.get(email);
//     if (targetSocketId) {
//       io.to(targetSocketId).emit('hey', { signal: signalData, from });
//     } else {
//       console.warn(`❌ No socket ID found for email: ${email}`);
//     }
//   });

//   // Accept call
//   socket.on('acceptCall', (data) => {
//     io.to(data.to).emit('callAccepted', data.signal);
//   });

//   // Clean up on disconnect
//   socket.on('disconnect', () => {
//     console.log(`❎ User disconnected: ${socket.id}`);

//     delete users[socket.id];

//     // Remove email mapping if any
//     for (const [email, id] of emailToSocket.entries()) {
//       if (id === socket.id) {
//         emailToSocket.delete(email);
//         break;
//       }
//     }

//     io.sockets.emit('allUsers', emailToSocket);
//   });
// });

// server.listen(5500, () => {
//   console.log('🚀 Server running on port 5500');
// });


const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = require('./app');

// Allow frontend to connect
app.use(cors({
  origin: 'http://localhost:8080', // Adjust if needed
  methods: ['GET', 'POST'],
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

// Email to socket map
const emailToSocket = {};
const socketToEmail = {};

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Register user email
  socket.on("registerUser", (email) => {
    emailToSocket[email] = socket.id;
    socketToEmail[socket.id] = email; // if you're tracking this reverse map
    console.log(`✅ Registered user: ${email} → ${socket.id}`);
  });

  
  socket.on("logout", () => {
    const email = socketToEmail[socket.id];
    if (email) {
      console.log(`👋 User logged out: ${email}`);
      delete emailToSocket[email];
      delete socketToEmaixl[socket.id];
    }
  });
  

  // Send all connected user emails
  socket.on('requestUsers', () => {
    const allEmails = emailToSocket;
    console.log(allEmails);
    socket.emit('allUsers', allEmails);
  });

  // Handle user calling another by email
  socket.on('callUserByEmail', ({ email, signalData, from }) => {
    const targetSocketId = emailToSocket[email];
    console.log("📨 Email to socket map:", emailToSocket);
    if (targetSocketId) {
      console.log(`📞 Calling ${email} at socket ID ${targetSocketId}`);
      io.to(targetSocketId).emit('incomingCall', { signalData, from }); // 👈 fix this name
    } else {
      console.warn(`❌ No socket found for ${email}`);
    }
  });
  

  // Handle call acceptance
  socket.on('acceptCall', ({ to, signal }) => {
    io.to(to).emit('callAccepted', signal);
  });

  // Optional: heartbeat ping-pong
  socket.on('ping', () => socket.emit('pong'));

  // Cleanup on disconnect
  
});

// Start server
server.listen(5500, () => {
  console.log('🚀 Server running at http://localhost:5500');
});
