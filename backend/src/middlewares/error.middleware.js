const ApiError = require('../utils/ApiError');

// Central error handler — must be registered last in app.js.
function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (!isApiError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = errorMiddleware;
