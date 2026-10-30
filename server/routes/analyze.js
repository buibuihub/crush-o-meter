import express from 'express';
import { analyzeCompatibility, extractCelebrityProfile } from '../openrouter.js';
import { searchPinterestImages } from '../serper.js';
import {
  AppError,
  asyncHandler,
  cleanMultiline,
  cleanString,
  normalizeTraits,
} from '../utils.js';

export const analyzeRouter = express.Router();
export const imagesRouter = express.Router();

const MBTI_PATTERN = /^[EI][NS][TF][JP]$/i;

function normalizeProfile(value, { requireDetails }) {
  const profile = value && typeof value === 'object' ? value : {};
  const mbti = cleanString(profile.mbti, 32).toUpperCase();
  const traits = normalizeTraits(profile.traits, 8);
  const hobbies = cleanMultiline(profile.hobbies, 400);
  const communicationStyle = cleanString(profile.communicationStyle, 120);
  const name = cleanString(profile.name, 60);

  if (requireDetails) {
    if (!MBTI_PATTERN.test(mbti)) {
      throw new AppError(400, 'INVALID_PROFILE', 'Pick a valid MBTI type.');
    }
    if (traits.length === 0) {
      throw new AppError(400, 'INVALID_PROFILE', 'Add at least one personality trait.');
    }
    if (!hobbies) {
      throw new AppError(400, 'INVALID_PROFILE', 'Add a few hobbies or interests.');
    }
    if (!communicationStyle) {
      throw new AppError(400, 'INVALID_PROFILE', 'Choose a communication style.');
    }
  }

  return { name, mbti, traits, hobbies, communicationStyle };
}

analyzeRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const isCelebrity = req.body?.isCelebrity === true;
    const selfProfile = normalizeProfile(req.body?.self, { requireDetails: true });
    let crushProfile;
    let analysisMeta;

    if (isCelebrity) {
      const celebrityName = cleanString(req.body?.celebrityName, 80);
      if (!celebrityName) {
        throw new AppError(400, 'INVALID_NAME', 'Enter your celebrity crush’s full name.');
      }

      const extracted = await extractCelebrityProfile(celebrityName);
      crushProfile = extracted.profile;

      const analysis = await analyzeCompatibility(selfProfile, crushProfile, true);
      analysisMeta = {
        model: analysis.model,
        fallbackUsed: analysis.fallbackUsed || extracted.fallbackUsed,
      };

      return res.json({
        isCelebrity,
        profile: crushProfile,
        compatibility: analysis.compatibility,
        meta: analysisMeta,
      });
    }

    crushProfile = normalizeProfile(req.body?.crush, { requireDetails: true });
    const analysis = await analyzeCompatibility(selfProfile, crushProfile, false);
    analysisMeta = {
      model: analysis.model,
      fallbackUsed: analysis.fallbackUsed,
    };

    return res.json({
      isCelebrity,
      profile: crushProfile,
      compatibility: analysis.compatibility,
      meta: analysisMeta,
    });
  }),
);

imagesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const celebrityName = cleanString(req.body?.celebrityName, 80);
    if (!celebrityName) {
      throw new AppError(400, 'INVALID_NAME', 'Enter a celebrity name to find moodboard images.');
    }

    const result = await searchPinterestImages(celebrityName, req.body?.page);
    res.json(result);
  }),
);
