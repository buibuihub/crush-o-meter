export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function cleanString(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function cleanMultiline(value, maxLength = 1000) {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, maxLength);
}

export function normalizeTraits(value, maxItems = 8) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const seen = new Set();
  return raw
    .map((trait) => cleanString(String(trait), 48))
    .filter((trait) => {
      const key = trait.toLowerCase();
      if (!trait || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxItems);
}

export function normalizeStringList(value, maxItems = 5, maxLength = 320) {
  const raw = Array.isArray(value) ? value : [];
  const seen = new Set();
  return raw
    .map((item) => cleanString(String(item), maxLength))
    .filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxItems);
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function safeHttpUrl(value) {
  return typeof value === 'string' && isHttpUrl(value) ? value : null;
}

export function createRateLimit({ windowMs, max, scope }) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${scope}:${req.ip}`;
    const recent = (buckets.get(key) || []).filter((time) => now - time < windowMs);

    if (recent.length >= max) {
      const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'That was a lot of romance. Take a breath and try again shortly.',
        },
      });
    }

    recent.push(now);
    buckets.set(key, recent);
    return next();
  };
}
