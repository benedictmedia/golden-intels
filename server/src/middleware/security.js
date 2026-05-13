const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// CORS whitelist – adjust as needed for production domains
const whitelist = [
  'http://localhost:5173', // dev client
  'https://your-domain.vercel.app', // production client
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Rate limiter – 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  helmet,
  limiter,
  corsOptions,
};
