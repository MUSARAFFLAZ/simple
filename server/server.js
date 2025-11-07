const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_jwt_secret_key'; // In a real app, use a strong, environment-variable-based secret

app.use(cors());
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'db.json');

// Helper to read from db.json
const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
  }
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

// Helper to write to db.json
const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// Register route
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();

  if (db.users.find(u => u.username === username)) {
    return res.status(400).send('User already exists');
  }

  const newUser = { username, password }; // In a real app, hash the password!
  db.users.push(newUser);
  writeDb(db);

  res.status(201).send('User registered successfully');
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();

  const user = db.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(400).send('Invalid credentials');
  }

  const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Protected profile route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}! This is your protected profile.` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
