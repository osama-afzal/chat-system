const { io } = require('socket.io-client');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MmExYzc0ZC0yYmM3LTQ0OWItOGFmNC01YmZjMmJmM2JmNGUiLCJ1c2VybmFtZSI6ImVudnlCbHVlIiwiaWF0IjoxNzc4NTQzMzMyLCJleHAiOjE3Nzg2Mjk3MzJ9.pndk4-Kci-cBK_E8k5N4M9iMT4N04D2VNezJa_zkVOo';
const roomId = 'room-1';

const socket = io('http://localhost:3000', {
  auth: {
    token,
  },
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  socket.emit('room.join', {
    roomId,
  });

  setTimeout(() => {
    socket.emit('message.send', {
      roomId,
      content: 'hello from client',
    });
  }, 1000);
});

socket.on('room.joined', (data) => {
  console.log('Joined room:', data);
});

socket.on('message.new', (data) => {
  console.log('New message:', data);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.log('Connection error:', err.message);
});