const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const app = express();

require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cookieParser());
app.use(express.json());

// Set up session middleware
app.use(session({
  secret: 'your_secret_key',  // Replace with a secure random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }    // Set secure: true if using HTTPS
}));

// Route to handle Google OAuth callback and create session
app.post('/auth/google/callback', async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    // Store user information in the session
    req.session.user = {
      id: payload['sub'],
      email: payload['email'],
      name: payload['name']
    };
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in first.' });
  }
}

// Protected route example
app.get('/protected', isAuthenticated, (req, res) => {
  res.send('Welcome to the protected page, ' + req.session.user.name);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

