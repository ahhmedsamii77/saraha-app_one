export function globalErrorHandler(error, req, res, next) {
  return res.status(error.cause || 500).json({ message: error.message, stack: error.stack, error });
}