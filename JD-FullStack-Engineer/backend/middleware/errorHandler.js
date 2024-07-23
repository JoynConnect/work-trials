// Centralized error handling middleware
function errorHandler(err, req, res, next) {
  // Log the error for debugging (optional)
  console.error(err);

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Specific error handling (examples)
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map(e => e.message) });
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  // Generic error response
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
