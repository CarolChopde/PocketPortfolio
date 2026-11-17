import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

/**
 * Authentication Middleware:
 * 1. Checks for Authorization header (Bearer <token>)
 * 2. Verifies JWT signature using JWT_SECRET
 * 3. Attaches decoded user info (id, email) to req.user
 * 4. Also supports 'x-user-id' header for development/Postman testing in Phase 2
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <TOKEN>"

  if (token) {
    const secret = process.env.JWT_SECRET || 'pocketportfolio_super_secret_jwt_key_2026';
    jwt.verify(token, secret, (err, decoded: any) => {
      if (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }
      req.user = { id: decoded.id, email: decoded.email };
      next();
    });
    return;
  }

  // Development fallback: Allow passing x-user-id header during API testing
  const devUserId = req.headers['x-user-id'] as string;
  if (devUserId) {
    req.user = { id: devUserId, email: 'dev@pocketportfolio.local' };
    next();
    return;
  }

  res.status(401).json({ error: 'Access token required. Please log in.' });
};
