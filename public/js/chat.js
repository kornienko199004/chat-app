const socket = io();

const form = document.querySelector('form');
const input = document.querySelector('input');
const button = document.querySelector('button');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;

form.addEventListener('submit', (e) => {
    e.preventDefault();

    button.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {

        button.removeAttribute('disabled');
        input.value = null;
        input.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message delivered');
    });
});

socket.on('message', (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate, {
        createdAt: moment(msg.createdAt).format('HH:mm'),
        message: msg.text,
    });
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (msg) => {
    const html = Mustache.render(urlTemplate, {
        url: msg.text,
        createdAt: moment(msg.createdAt).format('HH:mm'),
    });
    messages.insertAdjacentHTML('beforeend', html);
});

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        sendLocationButton.removeAttribute('disabled');
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, (ack) => {
            console.log(ack);
        });
    });
});