// Step 1: Format and send any error passed via next(error)
export const errorHandler = (err, req, res, next) => {
  console.log('error in request:', err.message);

  // Our own errors use statusCode; older code in this project uses status
  let status = err.statusCode || err.status || 500;
  let message = err.message;

  // MySQL "duplicate value" error (e.g. email already registered)
  if (err.code === 'ER_DUP_ENTRY') {
    status = 400;
    message = 'Duplicate value entered for a unique field';
  }

  // Never show internal details (SQL, Gemini errors) to the user
  if (status >= 500 || err.name === 'ApiError') {
    if (err.name === 'ApiError') status = 502; // Gemini service failed
    message = 'Something went wrong, try again later';
  }

  return res.status(status).json({ success: false, message });
};