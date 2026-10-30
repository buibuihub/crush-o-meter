import { config } from './config.js';
import { AppError, cleanString, isHttpUrl, safeHttpUrl } from './utils.js';

const IMAGE_ENDPOINT = 'https://google.serper.dev/images';
const SEARCH_ENDPOINT = 'https://google.serper.dev/search';
const PINS_PER_PAGE = 9;
const IMAGE_QUERY_VARIANTS = [
  (name) => `${name} aesthetic pinterest`,
  (name) => `${name} pinterest moodboard`,
  (name) => `${name} aesthetic inspiration`,
  (name) => `${name} style pinterest`,
  (name) => `${name} photos aesthetic`,
  (name) => `${name} outfit inspiration`,
  (name) => `${name} wallpaper aesthetic`,
  (name) => `${name} pinterest outfits`,
  (name) => `${name} beauty aesthetic`,
  (name) => `${name} vibe aesthetic`,
];
const CACHE_TTL_MS = 15 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
const PHOTO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const EMPTY_PHOTO_CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();
const searchCache = new Map();
const photoCache = new Map();
const SITE_NAMES = new Set([
  'facebook',
  'imdb',
  'instagram',
  'pinterest',
  'rotten tomatoes',
  'spotify',
  'tiktok',
  'tmdb',
  'twitter',
  'wikipedia',
  'x',
  'youtube',
]);

function normalizeForCompare(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + cost,
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function isLikelyCorrection(original, candidate) {
  const source = normalizeForCompare(original);
  const target = normalizeForCompare(candidate);
  if (!source || !target || source === target) return false;
  if (target.startsWith(source)) return false;

  const distance = levenshtein(source, target);
  const limit = Math.min(3, Math.max(1, Math.floor(Math.max(source.length, target.length) * 0.3)));
  return distance > 0 && distance <= limit;
}

function cleanEntityName(value) {
  let name = cleanString(value, 140);
  if (!name) return '';

  name = name
    .replace(/\s*[|•·]\s*.*$/u, '')
    .replace(/\s+[\u2013\u2014-]\s+.*$/u, '')
    .replace(
      /\s*:\s*(?:movies?|tv|bio|biography|actor|actress|singer|profile|news|photos?|pictures?|videos?).*$/iu,
      '',
    )
    .replace(
      /\s+(?:on\s+)?(?:Instagram|Wikipedia|IMDb|Facebook|TikTok|YouTube|Twitter|Spotify|Rotten Tomatoes|Official Site)\b.*$/iu,
      '',
    )
    .replace(/\s+(?:he|she|they)\s*\/\s*(?:him|her|them)\b/iu, '')
    .replace(/\s*\([^)]*\)\s*$/u, '')
    .replace(/,\s+.*$/u, '')
    .replace(/^(?:listen to|films? starring|movies? starring|watch|explore|see|stream|shop)\s+/iu, '')
    .replace(/\s+(?:films?|movies?)\s+(?:and|&)\s+(?:shows?|tv).*$/iu, '')
    .replace(/\s+(?:songs?|albums?|music videos?)\b.*$/iu, '')
    .replace(
      /\s+(?:movies?|tv|shows?|bio|biography|age|height|net worth|news|photos?|pictures?|videos?)\b.*$/iu,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (!name || name.length < 2 || SITE_NAMES.has(normalizeForCompare(name))) return '';
  return cleanString(name, 80);
}

function sourceDomain(item) {
  const raw = cleanString(item?.displayedLink || item?.link || '', 300).toLowerCase();
  const match = raw.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/);
  return match ? match[1] : '';
}

function summarizeDescription(value) {
  const text = cleanString(value, 240);
  if (!text) return '';
  const sentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0] || text;
  return cleanString(sentence, 180);
}

function scoreDescription(value, item) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const text = value.toLowerCase();
  const domain = sourceDomain(item);
  let score = Math.min(value.length, 160) / 160;

  if (/\b(actor|actress|singer|rapper|musician|model|comedian|artist|born|known for|is an?)\b/.test(text)) {
    score += 3;
  }
  if (/\b(followers|photos and videos|instagram|tiktok|youtube)\b/.test(text)) {
    score -= 3;
  }
  if (/(wikipedia|imdb|britannica|themoviedb|rottentomatoes|famousbirthdays)\./.test(domain)) {
    score += 2;
  }
  if (/(instagram|facebook|tiktok|twitter|x)\./.test(domain)) {
    score -= 1;
  }
  return score;
}

const PERSON_PATTERN =
  /\b(?:actor|actress|singer|rapper|musician|songwriter|model|comedian|artist|footballer|soccer player|basketball player|baseball player|american football player|tennis player|volleyball player|golfer|swimmer|skier|surfer|skateboarder|racing driver|formula one driver|athlete|boxer|wrestler|director|producer|author|writer|politician|businessman|businesswoman|entrepreneur|youtuber|influencer|celebrity|socialite|personality|presenter|television host|talk show host|journalist|poet|novelist|dancer|choreographer|magician|chef|architect|painter|photographer|designer|fashion designer|king|queen|prince|princess|president|prime minister|senator|governor|lawyer|judge|scientist|physicist|astronaut|philosopher|historian|professor|streamer|gamer|adult actor|adult model|playmate|social media personality|person)\b/iu;

const NON_PERSON_PATTERN =
  /\b(?:company|corporation|brand|retailer|manufacturer|business|enterprise|organization|organisation|agency|studio|record label|band|boy band|girl group|musical group|group|duo|trio|ensemble|orchestra|choir|fictional character|character|given name|masculine name|feminine name|surname|family name|film|movie|television series|tv series|web series|album|song|single|video game|software|app|website|restaurant|store|shop|chain|hotel|airline|aircraft|vehicle|car model|city|capital|country|state|province|municipality|town|village|river|mountain|island|lake|university|college|school|football club|sports club|sports team|team|league|competition|event|award|prize|magazine|newspaper|book|novel|play|musical|opera|painting|sculpture|building|museum|bridge|tower|park)\b/iu;

const BIOGRAPHY_DOMAIN_PATTERN =
  /(^|\.)(wikipedia\.org|imdb\.com|themoviedb\.org|famousbirthdays\.com|biography\.com|britannica\.com|allmovie\.com|rottentomatoes\.com)$/iu;

function isBiographySource(item) {
  return BIOGRAPHY_DOMAIN_PATTERN.test(sourceDomain(item));
}

function looksLikePersonProfile(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  if (PERSON_PATTERN.test(text)) return true;
  if (NON_PERSON_PATTERN.test(text)) return false;
  if (name === name.toUpperCase() && /\s/.test(name) && name.length > 4) return false;
  if (
    /\b(?:inc|llc|ltd|corp|company|brand|shop|store|reviews?|official|website|movies?|films?|songs?|albums?|tv|shows?|news|bio|biography|profile|stats)\b/iu.test(
      name,
    )
  ) {
    return false;
  }

  return name.split(/\s+/).filter(Boolean).length <= 5;
}

function isSamePersonName(first, second) {
  if (!first || !second) return false;
  if (first === second) return true;

  const shorter = first.length <= second.length ? first : second;
  const longer = first.length <= second.length ? second : first;
  if (shorter.length < 8 || shorter.split(' ').length < 2) return false;
  return longer.startsWith(`${shorter} `);
}

function dedupePersonEntries(entries) {
  const merged = [];

  for (const entry of entries) {
    const entryKey = normalizeForCompare(entry.name);
    const existing = merged.find((candidate) =>
      isSamePersonName(normalizeForCompare(candidate.name), entryKey),
    );

    if (!existing) {
      merged.push({ ...entry });
      continue;
    }

    if (entry.name.length < existing.name.length) {
      existing.name = entry.name;
    }
    if (entry.score > existing.score) {
      existing.description = entry.description;
      existing.score = entry.score;
    }
    if (!existing.photo && entry.photo) {
      existing.photo = entry.photo;
    }
    existing.biography = existing.biography || entry.biography;
  }

  return merged;
}

function mapSearchSuggestions(payload) {
  const entries = [];
  const byKey = new Map();

  const add = (rawName, description, photo, source, isKnowledgeGraph = false) => {
    const name = cleanEntityName(rawName);
    const key = normalizeForCompare(name);
    if (!name || !key || SITE_NAMES.has(key)) return;

    const existing = byKey.get(key);
    const candidate = existing || {
      name,
      photo: null,
      description: '',
      score: Number.NEGATIVE_INFINITY,
      biography: false,
    };

    if (!existing) {
      byKey.set(key, candidate);
      entries.push(candidate);
    }

    if (isKnowledgeGraph || isBiographySource(source)) {
      candidate.biography = true;
    }

    const safePhoto = safeHttpUrl(photo);
    if (safePhoto && !candidate.photo) candidate.photo = safePhoto;

    const summary = summarizeDescription(description);
    const score = isKnowledgeGraph ? 100 : scoreDescription(summary, source);
    if (summary && score > candidate.score) {
      candidate.description = summary;
      candidate.score = score;
    }
  };

  const knowledgeGraph = payload?.knowledgeGraph;
  if (knowledgeGraph) {
    add(
      knowledgeGraph.title,
      knowledgeGraph.description || knowledgeGraph.type,
      knowledgeGraph.imageUrl,
      { link: knowledgeGraph.descriptionLink || knowledgeGraph.website || '' },
      true,
    );
  }

  const organic = Array.isArray(payload?.organic) ? payload.organic : [];
  for (const item of organic) {
    add(
      item?.title,
      item?.snippet || item?.description,
      item?.thumbnailUrl || item?.imageUrl,
      item,
    );
  }

  return dedupePersonEntries(entries)
    .filter(
      ({ name, description, biography }) =>
        biography && looksLikePersonProfile(name, description),
    )
    .map(({ name, photo, description }) => ({ name, photo, description }));
}

function extractCorrection(query, payload) {
  const candidates = [];
  const sentQuery = cleanString(payload?.searchParameters?.q, 80);
  const knowledgeGraphName = cleanEntityName(payload?.knowledgeGraph?.title);
  const organicNames = (Array.isArray(payload?.organic) ? payload.organic : [])
    .map((item) => cleanEntityName(item?.title))
    .filter(Boolean);

  if (sentQuery) candidates.push(sentQuery);
  if (knowledgeGraphName) candidates.push(knowledgeGraphName);
  candidates.push(...organicNames);

  const seen = new Set();
  for (const candidate of candidates) {
    const key = normalizeForCompare(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (isLikelyCorrection(query, candidate)) return candidate;
  }

  return '';
}

async function postSerper(endpoint, body) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': config.serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new AppError(504, 'SERPER_TIMEOUT', 'The search took too long. Try again.');
    }
    throw new AppError(502, 'SERPER_UNAVAILABLE', 'Could not reach the search service.');
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new AppError(429, 'SERPER_RATE_LIMITED', 'The search limit was reached. Try again shortly.');
    }
    console.error(`[serper] Search request failed (${response.status}).`);
    throw new AppError(502, 'SERPER_UNAVAILABLE', 'The search service is unavailable right now.');
  }

  try {
    return await response.json();
  } catch {
    throw new AppError(502, 'SERPER_BAD_RESPONSE', 'The search returned an unreadable response.');
  }
}

async function findCelebrityPhoto(name) {
  const cacheKey = normalizeForCompare(name);
  if (!cacheKey) return null;

  const cached = photoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.photo;

  const payload = await postSerper(IMAGE_ENDPOINT, { q: name, num: 3 });
  const images = Array.isArray(payload?.images) ? payload.images : [];
  const lowerName = name.toLowerCase();
  const matchingImage = images.find((image) =>
    cleanString(image?.title, 220).toLowerCase().includes(lowerName),
  );
  const image = matchingImage || images[0];
  const photo = safeHttpUrl(image?.thumbnailUrl) || safeHttpUrl(image?.imageUrl);

  if (photoCache.size >= 500) {
    const oldestKey = photoCache.keys().next().value;
    photoCache.delete(oldestKey);
  }
  photoCache.set(cacheKey, {
    photo,
    expiresAt: Date.now() + (photo ? PHOTO_CACHE_TTL_MS : EMPTY_PHOTO_CACHE_TTL_MS),
  });
  return photo;
}

async function enrichSuggestionPhotos(suggestions) {
  const missing = suggestions.filter((suggestion) => !suggestion.photo);
  if (missing.length === 0) return;

  const photos = await Promise.all(
    missing.map((suggestion) => findCelebrityPhoto(suggestion.name).catch(() => null)),
  );
  missing.forEach((suggestion, index) => {
    suggestion.photo = photos[index] || null;
  });
}

export async function searchCelebrities(rawQuery) {
  const query = cleanString(rawQuery, 80);
  if (!query) {
    throw new AppError(400, 'INVALID_QUERY', 'Enter a celebrity name to search.');
  }
  if (!config.serperKey) {
    throw new AppError(
      503,
      'SERPER_NOT_CONFIGURED',
      'Celebrity search is not configured yet. Add SERPER_API_KEY to the server .env file.',
    );
  }

  const cacheKey = normalizeForCompare(query) || query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const payload = await postSerper(SEARCH_ENDPOINT, {
    q: query,
    num: 10,
    autocorrect: true,
  });
  const correctedQuery = extractCorrection(query, payload) || query;
  const suggestions = mapSearchSuggestions(payload).slice(0, 5);
  await enrichSuggestionPhotos(suggestions);

  const result = { correctedQuery, suggestions };
  if (searchCache.size >= 200) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
  searchCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
  });
  return result;
}

function normalizePinPage(value) {
  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export async function searchPinterestImages(celebrityName, rawPage = 1) {
  const name = cleanString(celebrityName, 80);
  if (!name) {
    throw new AppError(400, 'INVALID_NAME', 'Enter a celebrity name to build a moodboard.');
  }

  if (!config.serperKey) {
    throw new AppError(
      503,
      'SERPER_NOT_CONFIGURED',
      'Pinterest images are not configured yet. Add SERPER_API_KEY to the server .env file.',
    );
  }

  const page = normalizePinPage(rawPage);
  const cacheKey = `${name.toLowerCase()}::${page}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const queryVariant = IMAGE_QUERY_VARIANTS[(page - 1) % IMAGE_QUERY_VARIANTS.length];
  const serperPage = Math.floor((page - 1) / IMAGE_QUERY_VARIANTS.length) + 1;

  let response;
  try {
    response = await fetch(IMAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-KEY': config.serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: queryVariant(name),
        num: PINS_PER_PAGE,
        page: serperPage,
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new AppError(504, 'SERPER_TIMEOUT', 'The Pinterest search took too long. Try again.');
    }
    throw new AppError(502, 'SERPER_UNAVAILABLE', 'Could not reach the image search service.');
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new AppError(429, 'SERPER_RATE_LIMITED', 'The Pinterest search limit was reached. Try again shortly.');
    }
    console.error(`[serper] Image search failed (${response.status}).`);
    throw new AppError(502, 'SERPER_UNAVAILABLE', 'The image search service is unavailable right now.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new AppError(502, 'SERPER_BAD_RESPONSE', 'The image search returned an unreadable response.');
  }

  const seen = new Set();
  const images = (Array.isArray(payload?.images) ? payload.images : [])
    .map((image) => {
      const imageUrl = image?.imageUrl || image?.thumbnailUrl;
      const sourceUrl = image?.link || image?.sourceUrl || '';
      if (!isHttpUrl(imageUrl) || seen.has(imageUrl)) return null;
      seen.add(imageUrl);

      return {
        id: imageUrl,
        imageUrl,
        sourceUrl: isHttpUrl(sourceUrl) ? sourceUrl : '',
        title: cleanString(image?.title || `${name} aesthetic`, 220),
        domain: cleanString(image?.domain || image?.source, 80),
        width: Number(image?.imageWidth) || null,
        height: Number(image?.imageHeight) || null,
      };
    })
    .filter(Boolean)
    .slice(0, PINS_PER_PAGE);

  const result = { images, page, hasMore: images.length > 0 };

  if (cache.size >= 500) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });

  return result;
}
