const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/fridge', require('./routes/fridge.routes'));
app.use('/api/barcode', require('./routes/barcode.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Freedge API running' });
});

module.exports = app;