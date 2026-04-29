const notFoundMiddleware = (req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
};

module.exports = notFoundMiddleware;
