module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {

      // User must be authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // Role validation
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();

    } catch (error) {

      console.error("RBAC Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });

    }
  };
};