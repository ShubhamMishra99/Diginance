/**
 * Consistent JSON shapes for API errors (does not throw).
 */
function sendError(res, statusCode, message, details) {
  const body = {
    success: false,
    message: message || 'Request failed',
  };
  if (details !== undefined && details !== null) {
    body.details = details;
  }
  return res.status(statusCode).json(body);
}

function sendServerError(res, error, logContext) {
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message || 'Internal server error';
  if (logContext) {
    console.error(`[${logContext}]`, error);
  } else {
    console.error(error);
  }
  return sendError(res, 500, message);
}

module.exports = {
  sendError,
  sendServerError,
};
