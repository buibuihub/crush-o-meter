export class ApiError extends Error {
  constructor(message, status = 0, code = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0, 'NETWORK');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || 'Something went wrong. Please try again.',
      response.status,
      payload?.error?.code || 'UNKNOWN',
    );
  }

  return payload;
}

export const api = {
  health: () => request('/api/health'),
  analyze: (payload) => request('/api/analyze', { method: 'POST', body: payload }),
  images: (payload) => request('/api/images', { method: 'POST', body: payload }),
  searchCeleb: (query, { signal } = {}) =>
    request(`/api/search-celeb?q=${encodeURIComponent(query)}`, { signal }),
};
