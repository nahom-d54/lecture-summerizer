// Vercel serverless function entry point
// This file delegates the request to the compiled backend application

// Import the built backend app
// Note: We depend on the build step to create backend/dist
const app = require('../backend/dist/index.js').default;

module.exports = app;
