import crypto from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { db } from './db.js';
import { AppError } from './utils.js';

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [salt, expectedHex] = String(stored).split(':');
  if (!salt || !expectedHex) return false;
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

export function createToken(user) {
  return jwt.sign({ sub: String(user.id) }, config.jwtSecret, {
    expiresIn: '7d',
    issuer: 'crush-o-meter',
  });
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

export function authRequired(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return next(new AppError(401, 'AUTH_REQUIRED', 'Sign in to use your boards.'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'crush-o-meter',
    });
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(Number(payload.sub));

    if (!user) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Your session is no longer valid.'));
    }

    req.user = user;
    return next();
  } catch {
    return next(new AppError(401, 'AUTH_REQUIRED', 'Your session has expired. Sign in again.'));
  }
}
