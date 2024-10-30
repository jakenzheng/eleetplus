// server.js
require('dotenv').config();
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to handle the Google OAuth callback
app.post('/auth/google/callback', async (req, res) => {
  const { id_token } = req.body;

  try {
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Extract user information
    const userId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    // Here, you could store the user info in your database or create a session.
    // For this example, we'll just respond with the user info.
    res.json({
      success: true,
      user: {
        id: userId,
        email: email,
        name: name,
      },
    });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

