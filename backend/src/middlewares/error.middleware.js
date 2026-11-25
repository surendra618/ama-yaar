const ApiError = require('../utils/ApiError');

// Central error handler — must be registered last in app.js.
function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isApiError = err instanceof ApiError;
  let statusCode = isApiError ? err.statusCode : err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle MongoDB duplicate key errors (E11000)
  const dupCode = err.code === 11000 || err.cause?.code === 11000;
  if (dupCode) {
    statusCode = 409;
    const keyValue = err.keyValue || err.cause?.keyValue;
    if (keyValue && typeof keyValue === 'object') {
      const [field, val] = Object.entries(keyValue)[0] || [];
      message = field
        ? `A record with ${field} "${val}" already exists. Please use a different value.`
        : 'This record already exists. Please use a different value.';
    } else {
      message = 'Duplicate entry: this record already exists.';
    }
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'value'}: ${err.value}`;
  }

  if (!isApiError && statusCode >= 500) {
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
