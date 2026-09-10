import jwt from 'jsonwebtoken';
import user_models from '../models/user_models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'asdfgasdhbsbdjbjhbdwjgbwkgwbbjmscbswygwekgkjgbskgjmjgacmgjc';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: false, 
        msg: 'Access denied. No authentication token provided.',
        isExpired: false
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        status: false, 
        msg: 'Invalid token format.',
        isExpired: false 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          status: false, 
          msg: 'Your session has expired. Please sign in again.', 
          isExpired: true 
        });
      }
      return res.status(401).json({ 
        status: false, 
        msg: 'Invalid session token. Please sign in again.', 
        isExpired: false 
      });
    }

    const user = await user_models.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        status: false, 
        msg: 'User session expired or account not found.',
        isExpired: true
      });
    }

    if (user.user && user.user.isDelete) {
      return res.status(403).json({ 
        status: false, 
        msg: 'This account has been deactivated.',
        isExpired: false
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      status: false, 
      msg: 'Authentication failed. Please sign in again.',
      isExpired: true
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    status: false, 
    msg: 'Access restricted. Administrator privileges required.' 
  });
};

