import express from 'express';
import { db } from '../db.js';
import {
  authRequired,
  createToken,
  hashPassword,
  publicUser,
  verifyPassword,
} from '../auth.js';
import { AppError, asyncHandler } from '../utils.js';

export const authRouter = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCredentials(body) {
  return {
    email: typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '',
    password: typeof body?.password === 'string' ? body.password : '',
    name: typeof body?.name === 'string' ? body.name.replace(/\s+/g, ' ').trim() : '',
  };
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = normalizeCredentials(req.body);

    if (name.length < 1 || name.length > 60) {
      throw new AppError(400, 'INVALID_NAME', 'Tell us your name (60 characters max).');
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      throw new AppError(400, 'INVALID_EMAIL', 'Enter a valid email address.');
    }
    if (password.length < 8 || password.length > 128) {
      throw new AppError(400, 'INVALID_PASSWORD', 'Use a password between 8 and 128 characters.');
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with that email already exists.');
    }

    const passwordHash = await hashPassword(password);
    const result = db
      .prepare(
        'INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      )
      .run(name, email, passwordHash, new Date().toISOString());

    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(Number(result.lastInsertRowid));

    res.status(201).json({
      token: createToken(user),
      user: publicUser(user),
    });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = normalizeCredentials(req.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const valid = user ? await verifyPassword(password, user.password_hash) : false;

    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    res.json({
      token: createToken(user),
      user: publicUser(user),
    });
  }),
);

authRouter.get('/me', authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
