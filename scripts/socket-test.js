const { io } = require('socket.io-client');

console.log('Starting socket test...')

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YmJiNzZiMy02ZjcxLTQ2YzMtYTJhNi03MTBmM2NkM2ZkYjkiLCJ1c2VybmFtZSI6ImtpbmRSZWQiLCJpYXQiOjE3Nzg0NTM0NjksImV4cCI6MTc3ODUzOTg2OX0.l8TnGK2Yq9zO_R2ZlTO2KG_-6iKizeIMi5ZWpceNeZc';

const socket = io('http://localhost:3000', {
    auth: {
        token
    }
});

socket.on('connect', () => {
    console.log('Connected: ', socket.id);

    socket.emit('message.send', {
    roomId: 'room-1',
    content: 'hello from socket auth',
    });
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

socket.on('message.echo', (data) => {
    console.log('Echo received:', data);
})