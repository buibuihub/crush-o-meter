export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export const TRAIT_SUGGESTIONS = [
  'Curious', 'Affectionate', 'Ambitious', 'Introverted', 'Adventurous',
  'Dry-humored', 'Empathetic', 'Spontaneous', 'Loyal', 'Creative',
  'Reserved', 'Playful', 'Independent', 'Deep-thinker', 'Warm',
  'Chaotic', 'Romantic', 'Grounded', 'Confident', 'Sensitive',
];

export const COMMUNICATION_STYLES = [
  { value: 'Playful and teasing', label: 'Playful & teasing' },
  { value: 'Direct and clear', label: 'Direct & clear' },
  { value: 'Deep and reflective', label: 'Deep & reflective' },
  { value: 'Warm and reassuring', label: 'Warm & reassuring' },
  { value: 'Slow-burn and private', label: 'Slow-burn & private' },
  { value: 'High-energy and expressive', label: 'High-energy & expressive' },
];

export const LOADING_LINES = [
  'Reading between the heartlines…',
  'Comparing your soft edges…',
  'Consulting the chemistry…',
  'Finding the tension worth talking about…',
  'Choosing honesty over horoscopes…',
];

export const DEMO_SELF = {
  name: 'You',
  mbti: 'INFP',
  traits: ['Curious', 'Romantic', 'Dry-humored'],
  hobbies: 'Film photography, late-night playlists, used bookstores',
  communicationStyle: 'Deep and reflective',
};

export const DEMO_CRUSH = {
  name: 'Your crush',
  mbti: 'ENTJ',
  traits: ['Ambitious', 'Direct', 'Adventurous'],
  hobbies: 'Trail running, live music, ambitious dinner plans',
  communicationStyle: 'Direct and clear',
};
