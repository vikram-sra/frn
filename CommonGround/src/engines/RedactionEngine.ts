import { PROFANITY_REGEX, REDACTION_BLOCK } from '../constants/profanityList';

/**
 * Live Redaction Engine
 * Replaces profanity with black blocks in real-time
 * Zero-lag local regex replacement
 */

export function redact(text: string): string {
    return text.replace(PROFANITY_REGEX, REDACTION_BLOCK);
}

export function containsProfanity(text: string): boolean {
    return PROFANITY_REGEX.test(text);
}

// Reset regex lastIndex for subsequent tests
export function resetRegex(): void {
    PROFANITY_REGEX.lastIndex = 0;
}
