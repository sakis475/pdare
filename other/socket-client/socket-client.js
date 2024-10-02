// client.js
const io = require('socket.io-client');

// Replace with your server's URL and port
const socket = io('http://localhost:3013');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('testio', (data) => {
  console.log('Received entityChanged event:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket.IO Error:', error);
});
