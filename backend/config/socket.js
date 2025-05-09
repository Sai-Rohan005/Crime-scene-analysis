const users = {};  // Keep track of users by their socket IDs
const emailToSocket = new Map(); // If needed, can map emails to socket IDs

module.exports = (io) => {
  io.on('connection', (socket) => {
    // Assign the socket's ID and store the connection
    if (!users[socket.id]) {
      users[socket.id] = socket.id;
    }

    // Emit the user's own socket ID
    socket.emit("yourId", socket.id);

    // Emit all users' information
    io.sockets.emit('allUsers', users);

    // Handle user disconnection
    socket.on('disconnect', () => {
      delete users[socket.id];
      io.sockets.emit('allUsers', users);  // Broadcast updated list of users
    });

    // Handle calling a user
    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
    });

    // Handle call acceptance
    socket.on('acceptCall', (data) => {
      io.to(data.to).emit('callAccepted', data.signal);
    });
  });
};
