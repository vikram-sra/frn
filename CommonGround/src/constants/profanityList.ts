// Constants for profanity filtering
export const PROFANITY_LIST: string[] = [
  'idiot',
  'stupid',
  'dumb',
  'moron',
  'fool',
  'jerk',
  'loser',
  // Add more words as needed - keeping list minimal for demo
];

// Regex pattern built from the list
export const PROFANITY_REGEX = new RegExp(
  PROFANITY_LIST.join('|'),
  'gi'
);

export const REDACTION_BLOCK = '████';
