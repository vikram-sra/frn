/**
 * 🚫 PROFANITY FILTER CONSTANTS
 * Maintains list of words to redact in real-time
 */

// ═══════════════════════════════════════════════════════════════
// 📜 PROFANITY LIST
// ═══════════════════════════════════════════════════════════════
export const PROFANITY_LIST: string[] = [
  // Insults
  'idiot',
  'stupid',
  'dumb',
  'moron',
  'fool',
  'jerk',
  'loser',
  'dumbass',
  'jackass',

  // More aggressive terms (for testing)
  'hate you',
  'shut up',
  'worthless',
  'pathetic',

  // Note: Add more words as needed
  // Keeping list moderate for demo purposes
];

// ═══════════════════════════════════════════════════════════════
// 🔧 REGEX PATTERN
// ═══════════════════════════════════════════════════════════════

// Build regex pattern with word boundaries for accurate matching
export const PROFANITY_REGEX = new RegExp(
  '\\b(' + PROFANITY_LIST.join('|') + ')\\b',
  'gi'
);

// ═══════════════════════════════════════════════════════════════
// 🎨 REDACTION DISPLAY
// ═══════════════════════════════════════════════════════════════

// The block character used to replace profanity
export const REDACTION_BLOCK = '████';

// Alternative styles
export const REDACTION_ASTERISKS = '****';
export const REDACTION_CENSORED = '[CENSORED]';
