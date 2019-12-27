const socket = io();

const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message);
    e.target.elements.message.value = null;
});

socket.on('message', (msg) => {
    console.log(msg);
});

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude });
    });
});