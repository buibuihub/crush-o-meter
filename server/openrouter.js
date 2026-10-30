import { config } from './config.js';
import {
  AppError,
  cleanString,
  normalizeStringList,
  normalizeTraits,
} from './utils.js';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const FALLBACK_MODEL = 'openrouter/free';

function extractContent(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('');
  }
  return '';
}

function parseJsonObject(content) {
  if (!content) {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'The AI returned an empty response. Try again.');
  }

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'The AI response was not valid JSON. Try again.');
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'The AI response was not valid JSON. Try again.');
  }
}

async function requestCompletion(model, messages, { maxTokens, temperature }) {
  let response;

  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.appUrl,
        'X-Title': 'Crush-O-Meter',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new AppError(504, 'AI_TIMEOUT', 'The AI took too long to answer. Please try again.');
    }
    throw new AppError(502, 'AI_UNAVAILABLE', 'Could not reach OpenRouter. Check your connection and try again.');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    if (
      (response.status === 400 || response.status === 422) &&
      /response_format/i.test(errorText)
    ) {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.appUrl,
          'X-Title': 'Crush-O-Meter',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        const retryable = response.status === 429 || response.status === 503;
        const error = new Error(`OpenRouter request failed with ${response.status}`);
        error.httpStatus = response.status;
        error.retryable = retryable;
        throw error;
      }
    } else {
      const retryable = response.status === 429 || response.status === 503;
      const error = new Error(`OpenRouter request failed with ${response.status}`);
      error.httpStatus = response.status;
      error.retryable = retryable;
      throw error;
    }
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'OpenRouter returned an unreadable response.');
  }

  const content = extractContent(payload);
  if (!content) {
    const error = new Error('AI_EMPTY_RESPONSE');
    error.retryable = true;
    error.code = 'AI_EMPTY_RESPONSE';
    throw error;
  }

  let data;
  try {
    data = parseJsonObject(content);
  } catch {
    const error = new Error('AI_INVALID_JSON');
    error.retryable = true;
    error.code = 'AI_INVALID_JSON';
    throw error;
  }

  return {
    data,
    model: payload?.model || model,
  };
}

async function openRouterJson(messages, options = {}) {
  if (!config.openRouterKey) {
    throw new AppError(
      503,
      'OPENROUTER_NOT_CONFIGURED',
      'OpenRouter is not configured yet. Add OPENROUTER_API_KEY to the server .env file.',
    );
  }

  const primaryModel = config.openRouterModel || FALLBACK_MODEL;
  const usesAutoRouter = primaryModel === 'openrouter/free' || primaryModel === FALLBACK_MODEL;
  const models = usesAutoRouter
    ? ['nvidia/nemotron-3-ultra-550b-a55b:free', 'openrouter/free']
    : [primaryModel, FALLBACK_MODEL];

  const requestOptions = {
    maxTokens: options.maxTokens || 1100,
    temperature: options.temperature ?? 0.65,
  };

  for (let index = 0; index < models.length; index += 1) {
    try {
      const result = await requestCompletion(models[index], messages, requestOptions);
      return {
        ...result,
        fallbackUsed: index > 0,
        requestedModel: primaryModel,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (error.retryable && index < models.length - 1) {
        continue;
      }

      if (error.retryable && (error.code === 'AI_EMPTY_RESPONSE' || error.code === 'AI_INVALID_JSON')) {
        throw new AppError(502, 'AI_BAD_RESPONSE', 'The AI response was not valid JSON. Try again.');
      }

      if (error.retryable) {
        throw new AppError(
          429,
          'AI_RATE_LIMITED',
          'OpenRouter free models are busy right now. Give it a minute, then try again.',
        );
      }

      if (error.httpStatus === 401 || error.httpStatus === 403) {
        console.error(`[openrouter] Authentication failed (${error.httpStatus}).`);
        throw new AppError(
          502,
          'AI_AUTH_FAILED',
          'OpenRouter rejected the server credentials. Check OPENROUTER_API_KEY.',
        );
      }

      console.error(`[openrouter] Request failed (${error.httpStatus || 'unknown'}).`);
      throw new AppError(502, 'AI_UNAVAILABLE', 'The AI service is unavailable right now. Try again.');
    }
  }

  throw new AppError(502, 'AI_UNAVAILABLE', 'The AI service is unavailable right now.');
}

function parseScore(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return Number.NaN;
}

export function normalizeCelebrityProfile(raw, requestedName) {
  const traits = normalizeTraits(raw?.traits, 6);
  const summary = cleanString(raw?.summary, 800);
  const mbti = cleanString(raw?.mbti, 24) || 'Unknown';

  if (!summary || traits.length === 0) {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'The celebrity profile came back incomplete. Try again.');
  }

  return {
    name: requestedName,
    traits,
    mbti,
    summary,
  };
}

export function normalizeCompatibility(raw) {
  const scoreNumber = parseScore(raw?.compatibilityScore);
  if (!Number.isFinite(scoreNumber)) {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'The chemistry score came back incomplete. Try again.');
  }

  const compatibilityScore = Math.max(0, Math.min(100, Math.round(scoreNumber)));
  const dynamicSummary = cleanString(raw?.dynamicSummary, 900);
  const advice = cleanString(raw?.advice, 900);
  const strengths = normalizeStringList(raw?.strengths, 5, 260);
  const challenges = normalizeStringList(raw?.challenges, 5, 260);

  if (!dynamicSummary || strengths.length === 0 || challenges.length === 0) {
    throw new AppError(502, 'AI_BAD_RESPONSE', 'The chemistry report came back incomplete. Try again.');
  }

  return {
    compatibilityScore,
    dynamicSummary,
    strengths,
    challenges,
    advice:
      advice ||
      'Lead with curiosity, listen more than you perform, and let the connection unfold at a human pace.',
  };
}

export async function extractCelebrityProfile(celebrityName) {
  const system = `You are a careful celebrity persona researcher and pop-culture writer.
Build a public-persona profile using only widely known public information: interviews, public statements, released work, and reputable coverage.
Never invent private facts, relationships, diagnoses, or unverified claims.
If an MBTI type is not publicly known, give a clearly marked estimate such as "INFP (estimated)".
Return only valid JSON with exactly this shape:
{"name": string, "traits": string[], "mbti": string, "summary": string}
Give 5 to 6 short, specific public-persona traits. Keep summary to 2 or 3 sentences.`;

  const user = `Create a public-persona profile for the celebrity: ${celebrityName}.`;

  const result = await openRouterJson(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 700, temperature: 0.35 },
  );

  return {
    profile: normalizeCelebrityProfile(result.data, celebrityName),
    model: result.model,
    fallbackUsed: result.fallbackUsed,
  };
}

export async function analyzeCompatibility(selfProfile, crushProfile, isCelebrity) {
  const system = `You are Crush-O-Meter, a perceptive, witty, and grounded compatibility analyst.
Compare the two personality profiles with emotional intelligence. This is a playful compatibility read, not a diagnosis, prediction, or claim about anyone's private feelings.
Be specific: connect your observations to the actual traits, hobbies, MBTI preferences, and communication styles provided.
Calibrate scores thoughtfully: reserve 90+ for exceptionally aligned profiles, use 70-89 for strong chemistry, 50-69 for promising-but-mixed, 30-49 for friction, and below 30 for fundamental mismatch.
Return only valid JSON with exactly this shape:
{
  "compatibilityScore": number,
  "dynamicSummary": string,
  "strengths": string[],
  "challenges": string[],
  "advice": string
}
Give 3 to 4 strengths and 2 to 3 challenges. dynamicSummary should be 2 to 3 vivid sentences. advice should be 2 to 4 practical sentences written directly to the user. Do not use markdown.`;

  const context = {
    user: selfProfile,
    crush: crushProfile,
    crushType: isCelebrity ? 'celebrity / public figure' : 'a real-life crush',
  };

  const user = `Here are the two profiles:
${JSON.stringify(context, null, 2)}

Write the compatibility report. For a celebrity crush, keep advice about the parasocial dynamic practical and self-aware. Never imply the celebrity has personal feelings for the user.`;

  const result = await openRouterJson(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 1200, temperature: 0.7 },
  );

  return {
    compatibility: normalizeCompatibility(result.data),
    model: result.model,
    fallbackUsed: result.fallbackUsed,
  };
}
