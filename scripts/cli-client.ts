import { io } from 'socket.io-client';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt('> ');
rl.prompt(true);

const socket = io('http://localhost:3000', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MmExYzc0ZC0yYmM3LTQ0OWItOGFmNC01YmZjMmJmM2JmNGUiLCJ1c2VybmFtZSI6ImVudnlCbHVlIiwiaWF0IjoxNzc4NjMzMDA4LCJleHAiOjE3Nzg3MTk0MDh9.u_-u-Yu0ELyyE0Q0WT9BssII08blhpCsG0mr5UbP64s',
  },
});

let currentRoomId = '';

socket.on('connect', () => {
  print('Connected');
});

socket.on('room.joined', (data) => {
  currentRoomId = data.roomId;
  print(`Joined room: ${data.roomId}`);
});

socket.on('message.new', (message) => {
  print(
    `[${message.roomId}] ${message.username}: ${message.content}`,
  );
});

socket.on('room.user_joined', (data) => {
  console.log(`${data.username} joined ${data.roomId}`);
});

socket.on('room.user_left', (data) => {
  console.log(`${data.username} left`);
});

socket.on('error', (err) => {
  print(`Error: ${err.message}`);
});

rl.on('line', (input) => {
  if (input.startsWith('/')) {
    handleCommand(input);
  } else {
    handleMessage(input);
  }
  rl.prompt();
});

function handleCommand(input: string) {
  const parts = input.trim().split(' ');

  const command = parts[0];

  switch (command) {
    case '/join': {
      const roomId = parts[1];

      if (!roomId) {
        print('Usage: /join <roomId>');
        return;
      }

      socket.emit('room.join', {
        roomId,
      });

      break;
    }

    case '/help': {
      print(`
                Available commands:

                /join <roomId>   Join a room
                /help            Show commands
                /exit            Exit client
            `);

      break;
    }

    case '/exit': {
      print('Disconnecting...');

      socket.disconnect();

      rl.close();

      process.exit(0);
    }

    default: {
      print(`Unknown command: ${command}`);
    }
  }
}

function handleMessage(input: string) {
  if (!currentRoomId) {
    print('Join a room first with /join <roomId>');

    return;
  }

  const content = input.trim();

  if (!content) {
    return;
  }

  socket.emit('message.send', {
    roomId: currentRoomId,
    content,
  });
}

function print(message: string) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  console.log(message);

  rl.prompt(true);
}