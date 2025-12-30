const net = require('net');

const host = 'ep-damp-morning-absybzqj-pooler.eu-west-2.aws.neon.tech';
const port = 5432;

console.log(`Attempting to connect to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
  console.log('Successfully connected!');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('Connection timed out.');
  socket.destroy();
});

socket.on('error', err => {
  console.log('Connection error:', err.message);
});

socket.connect(port, host);
