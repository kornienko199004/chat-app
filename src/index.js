const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New websocket connection');

    socket.emit('message', generateMessage('Welcome'));
    socket.broadcast.emit('message', generateMessage('A new user has joined!'));

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed');
        }

        io.emit('message', generateMessage(msg));
        callback();
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'));
    });

    socket.on('sendLocation', (pos, callback) => {
        console.log(pos);
        io.emit('locationMessage', generateMessage(`https://google.com/maps?q=${pos.latitude},${pos.longitude}`));
        callback('Location was delivered');
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
