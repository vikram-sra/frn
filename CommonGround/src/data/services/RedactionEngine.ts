/**
 * 🚫 LIVE REDACTION ENGINE
 * Replaces profanity with styled blocks in real-time
 * Zero-lag local regex replacement
 */

import { PROFANITY_REGEX, REDACTION_BLOCK } from '../constants/profanityList';

// ═══════════════════════════════════════════════════════════════
// 🔧 CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Redacts profanity from text, replacing with styled blocks
 */
export function redact(text: string): string {
    return text.replace(PROFANITY_REGEX, REDACTION_BLOCK);
}

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
    PROFANITY_REGEX.lastIndex = 0; // Reset for global regex
    return PROFANITY_REGEX.test(text);
}

/**
 * Reset regex lastIndex for subsequent tests
 */
export function resetRegex(): void {
    PROFANITY_REGEX.lastIndex = 0;
}

/**
 * Get profanity count in text
 */
export function countProfanity(text: string): number {
    resetRegex();
    const matches = text.match(PROFANITY_REGEX);
    return matches ? matches.length : 0;
}

/**
 * Partially redact (show first letter)
 */
export function partialRedact(text: string): string {
    return text.replace(PROFANITY_REGEX, (match) => {
        if (match.length <= 2) return REDACTION_BLOCK;
        return match[0] + '█'.repeat(match.length - 1);
    });
}
