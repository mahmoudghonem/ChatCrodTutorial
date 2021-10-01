const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users');

const botName = 'Chat Cord';

const app = express();
const server = http.createServer(app)
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//run when client connects
io.on('connection', socket => {


    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to chat cord'));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat `));

        //send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });



    // listen to chat messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        userLeave(user.id);;
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat `));
        }
        //send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));