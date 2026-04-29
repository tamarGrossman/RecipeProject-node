const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Access denied. Admins only.' } });
  }

  return next();
};

module.exports = admin;
