import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_jwt_key";

/**
 * Middleware to verify JWT token from Authorization header (Bearer <token>).
 * Attaches decoded user payload to req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication token is required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: "Invalid or expired token.",
      message: err.message,
    });
  }
};

/**
 * Middleware to restrict route access to specific roles.
 * Must be preceded by verifyToken.
 * Usage: requireRoles("Administrator", "Manager")
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. User identity not established." });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const isAllowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!isAllowed) {
      return res.status(403).json({
        error: "Access denied. Insufficient privileges.",
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

