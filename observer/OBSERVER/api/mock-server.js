// Simple Express mock server to implement the OpenAPI contract for accounts and auth
// Run: npm install express cors body-parser
//      node api/mock-server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// in-memory data
let accounts = [
  { id: 'account-1', title: 'test1', type: '模拟盘', visible: true, metadata: {} },
  { id: 'account-2', title: 'test2', type: '模拟盘', visible: true, metadata: {} },
  { id: 'account-3', title: 'trading_bot', type: '实盘', visible: true, metadata: {} }
];

// simple token simulation
let refreshStore = new Map();

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username) return res.status(400).json({ code: 400, message: 'username required' });
  // accept any password for mock
  const accessToken = 'access-' + Math.random().toString(36).slice(2);
  const refreshToken = 'refresh-' + Math.random().toString(36).slice(2);
  refreshStore.set(refreshToken, true);
  res.json({ accessToken, refreshToken, expiresIn: 3600 });
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || !refreshStore.has(refreshToken)) return res.status(401).json({ code: 401, message: 'invalid refresh' });
  const accessToken = 'access-' + Math.random().toString(36).slice(2);
  const newRefresh = 'refresh-' + Math.random().toString(36).slice(2);
  refreshStore.set(newRefresh, true);
  refreshStore.delete(refreshToken);
  res.json({ accessToken, refreshToken: newRefresh, expiresIn: 3600 });
});

// simple auth middleware (accept any Bearer token that starts with 'access-')
function auth(req, res, next) {
  const h = req.headers['authorization'];
  if (!h || typeof h !== 'string' || !h.startsWith('Bearer ')) return res.status(401).json({ code: 401, message: 'unauthorized' });
  const token = h.slice(7);
  if (!token.startsWith('access-')) return res.status(401).json({ code: 401, message: 'unauthorized' });
  next();
}

app.get('/accounts', auth, (req, res) => {
  res.json(accounts);
});

app.post('/accounts', auth, (req, res) => {
  const { title, type } = req.body || {};
  if (!title) return res.status(400).json({ code: 400, message: 'title required' });
  const acc = { id: uuidv4(), title, type: type || '模拟盘', visible: true, metadata: {} };
  accounts.push(acc);
  res.status(201).json(acc);
});

app.put('/accounts/:id', auth, (req, res) => {
  const id = req.params.id;
  const acc = accounts.find(a => a.id === id);
  if (!acc) return res.status(404).json({ code: 404, message: 'not found' });
  const { title, visible, metadata } = req.body || {};
  if (typeof title === 'string') acc.title = title;
  if (typeof visible === 'boolean') acc.visible = visible;
  if (metadata) acc.metadata = metadata;
  res.json(acc);
});

app.delete('/accounts/:id', auth, (req, res) => {
  const id = req.params.id;
  const idx = accounts.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, message: 'not found' });
  accounts.splice(idx, 1);
  res.status(204).end();
});

app.put('/accounts/order', auth, (req, res) => {
  const { order } = req.body || {};
  if (!Array.isArray(order)) return res.status(400).json({ code: 400, message: 'order must be array of ids' });
  const map = new Map(accounts.map(a => [a.id, a]));
  const newList = [];
  order.forEach(id => { if (map.has(id)) newList.push(map.get(id)); });
  // append any missing
  accounts.forEach(a => { if (!order.includes(a.id)) newList.push(a); });
  accounts = newList;
  res.json(accounts);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Mock server running on', port));
