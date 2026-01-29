const { app, connectDB } = require('../server/src/app');

// Ensure DB is connected before handling the request
connectDB();

module.exports = app;
