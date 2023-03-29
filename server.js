const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

io.on('connection', socket => {
    console.log("New client connected: " + socket.id);
    socket.on('user joined room', roomId => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const otherUsers = [];
        if (room) {
            room.forEach(id => {
                if (id != socket.id) {
                    otherUsers.push(id);
                }
            })
        }
        socket.join(roomId);
        socket.emit('all other users', otherUsers);
    });

    socket.on('peer connection request', ({ userIdToCall, sdp }) => {
        io.to(userIdToCall).emit("connection offer", { sdp, callerId: socket.id });
    });

    socket.on('connection answer', ({ userToAnswerTo, sdp }) => {
        io.to(userToAnswerTo).emit('connection answer', { sdp, answererId: socket.id })
    });

    socket.on('ice-candidate', ({ target, candidate }) => {
        io.to(target).emit('ice-candidate', { candidate, from: socket.id });
    });
});

server.listen(1337, () => console.log('server is running on port 1337'));