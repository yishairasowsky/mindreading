const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/spectator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'spectator.html'));
});

app.get('/performer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'performer.html'));
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (total: ${io.engine.clientsCount})`);

  socket.on('word-hover', (word) => {
    console.log(`word-hover received: "${word}" — broadcasting to ${io.engine.clientsCount - 1} other clients`);
    socket.broadcast.emit('reveal-word', word);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`  Spectator: http://localhost:${PORT}/spectator`);
  console.log(`  Performer: http://localhost:${PORT}/performer`);
});
