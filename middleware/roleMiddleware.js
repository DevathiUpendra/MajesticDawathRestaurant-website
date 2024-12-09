// server/middleware/roleMiddleware.js

const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.body.role;
    if (userRole == requiredRole) {
      next(); 
    } else {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
  };
};

module.exports = { authorizeRole };