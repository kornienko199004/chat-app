const socket = io();

const form = document.querySelector('form');
const input = document.querySelector('input');
const button = document.querySelector('button');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

console.log(Qs.parse(location.search));
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

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

const autoscroll = () => {
    const newMessage = messages.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessagesMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessagesMargin;

    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight;
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};

socket.on('message', (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        createdAt: moment(msg.createdAt).format('HH:mm'),
        message: msg.text,
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (msg) => {
    const html = Mustache.render(urlTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('HH:mm'),
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    document.querySelector('#sidebar').innerHTML = html;
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});