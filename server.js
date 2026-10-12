const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'docs')));

// --- Number Force (pick) config ---
let pickConfig = { category: 'cities', forceItem: 'Paris' };

app.get('/pick', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'pick.html'));
});

app.get('/pick/backstage', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'pick-backstage.html'));
});

app.get('/api/pick/config', (req, res) => {
  res.json(pickConfig);
});

app.post('/api/pick/config', (req, res) => {
  const { category, forceItem } = req.body;
  if (category && forceItem) {
    pickConfig = { category, forceItem };
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: 'Missing category or forceItem' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'spectator.html'));
});

app.get('/spectator', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'spectator.html'));
});

app.get('/performer', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'performer.html'));
});

app.get('/backstage', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'performer.html'));
});

app.get('/atlas', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'atlas.html'));
});

// Classic two-panel version (click to select country, then browse cities)
app.get('/atlas-classic', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'atlas-classic.html'));
});

// Interactive map version (hover city dots on a real world map)
app.get('/atlas-map', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'atlas-map.html'));
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`  Spectator: http://localhost:${PORT}/spectator`);
  console.log(`  Performer: http://localhost:${PORT}/performer`);
});
