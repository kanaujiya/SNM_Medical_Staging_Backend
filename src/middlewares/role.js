// src/middlewares/role.middleware.js
exports.isAdmin = (req, res, next) => {
  const user = req.user;

  if (user?.userType !== 'admin' && user?.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};
