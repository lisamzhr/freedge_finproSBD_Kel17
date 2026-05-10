require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startExpiryJob } = require('./src/jobs/expiry.job');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startExpiryJob();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

