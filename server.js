const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors'); // Import the cors middleware
const students = require('./students.json').students;
// 解析 url-encoded格式的表单数据
app.use(bodyParser.urlencoded({ extended: false }));
 
// 解析json格式的表单数据
app.use(bodyParser.json());
app.use(cors());


// Secret key for signing and verifying tokens
const secretKey = 'yourSecretKey';

// Middleware function for JWT authentication
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = user;
    next();
  });
};
app.get('/students', authenticateJWT, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const total = students.length;
  const pages = Math.ceil(total / limit);

  if (page > pages) {
    return res.status(404).json({ error: 'Page not found' });
  }

  const results = students.slice(offset, offset + limit);

  res.json({
    data: results,
    meta: {
      total,
      page,
      limit,
      pages
    }
  });
}); 


// Example route for generating a JWT token (login)
app.post('/login', (req, res) => {
  // Check user credentials (replace with your authentication logic)
  const username = req.body.username;
  const password = req.body.password;

  // Example authentication logic (replace with your actual logic)
  if (username === 'yourUsername' && password === 'yourPassword') {
    // Generate a JWT token
    const token = jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });

    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
