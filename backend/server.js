const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { logMailConfigStatus } = require('./utils/mailer');

dotenv.config({ path: path.join(__dirname, '.env') });
logMailConfigStatus();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

let mongoConnectionPromise;

function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => console.log('MongoDB connected'))
      .catch((err) => {
        mongoConnectionPromise = null;
        console.log(err);
      });
  }

  return mongoConnectionPromise;
}

app.use(async (req, res, next) => {
  await connectToMongo();
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admins'));

if (require.main === module) {
  connectToMongo();

  const PORT = Number(process.env.PORT) || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Close the duplicate backend terminal or stop the other Node process, then run npm run dev again.`);
      process.exit(1);
    }

    throw err;
  });
}

module.exports = app;
