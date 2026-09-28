import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_PASSWORD } from './config';

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers['authorization'];
  if (!header) {
    res.status(403).json({ message: 'You are not logged in' });
    return;
  }

  const token = typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice(7)
    : (header as string);

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as { id: string };
    if (decoded && decoded.id) {
      req.userId = decoded.id;
      next();
    } else {
      res.status(403).json({ message: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
