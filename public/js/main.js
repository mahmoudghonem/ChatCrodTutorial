const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get user name and room from url 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

// Join chat room
socket.emit('joinRoom', { username, room });

// get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //scroll down 
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    // emit msg to server
    socket.emit('chatMessage', msg);
    //clear msg
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//output msg to dom

function outputMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.username}<span> ${msg.time}</span></p>
    <p class="text">
     ${msg.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to dom 
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to dom 
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}