/**
 * 🧠 ENHANCED SENTIMENT ANALYSIS ENGINE
 * Determines sentiment for AI Pulse border coloring
 * Uses weighted scoring for more accurate detection
 */

import { COLORS } from '../constants/theme';

// ═══════════════════════════════════════════════════════════════
// 📚 WORD LIBRARIES
// ═══════════════════════════════════════════════════════════════

// Strong positive indicators (weight: 2)
const STRONG_POSITIVE = [
    'absolutely', 'completely agree', 'exactly', 'perfectly', 'love',
    'amazing', 'excellent', 'fantastic', 'brilliant', 'wonderful',
    "couldn't agree more", 'totally', 'definitely', 'certainly',
];

// Regular positive indicators (weight: 1)
const POSITIVE_WORDS = [
    'agree', 'yes', 'same', 'true', 'right', 'correct', 'understand',
    'see your point', 'makes sense', 'indeed', 'good', 'great',
    'like', 'support', 'appreciate', 'helpful', 'valid', 'fair',
    'reasonable', 'sensible', 'wise', 'smart', 'insightful',
];

// Strong negative indicators (weight: 2)
const STRONG_NEGATIVE = [
    'completely disagree', 'absolutely not', 'totally wrong', 'ridiculous',
    'absurd', 'nonsense', 'terrible', 'awful', 'horrible', 'hate',
    'never', 'impossible', 'unacceptable', 'outrageous',
];

// Regular negative indicators (weight: 1)
const NEGATIVE_WORDS = [
    'no', 'disagree', 'wrong', 'false', 'incorrect', 'but', 'however',
    'actually', 'different', 'oppose', 'against', 'bad', 'problem',
    'issue', 'concern', 'doubt', 'skeptical', 'unlikely', 'fail',
    'mistake', 'error', 'flawed', 'misguided',
];

// Neutral/balanced indicators
const NEUTRAL_INDICATORS = [
    'maybe', 'perhaps', 'possibly', 'might', 'could be', 'sometimes',
    'depends', 'on one hand', 'both sides', 'complicated', 'nuanced',
];

// ═══════════════════════════════════════════════════════════════
// 🎭 TYPES
// ═══════════════════════════════════════════════════════════════

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
    sentiment: Sentiment;
    confidence: number; // 0-1 scale
    positiveScore: number;
    negativeScore: number;
}

// ═══════════════════════════════════════════════════════════════
// 🔍 ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Analyzes text and returns detailed sentiment results
 */
export function analyzeSentimentDetailed(text: string): SentimentResult {
    const lowerText = text.toLowerCase();

    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Strong positive (weight: 2)
    for (const phrase of STRONG_POSITIVE) {
        if (lowerText.includes(phrase)) {
            positiveScore += 2;
        }
    }

    // Regular positive (weight: 1)
    for (const word of POSITIVE_WORDS) {
        if (lowerText.includes(word)) {
            positiveScore += 1;
        }
    }

    // Strong negative (weight: 2)
    for (const phrase of STRONG_NEGATIVE) {
        if (lowerText.includes(phrase)) {
            negativeScore += 2;
        }
    }

    // Regular negative (weight: 1)
    for (const word of NEGATIVE_WORDS) {
        if (lowerText.includes(word)) {
            negativeScore += 1;
        }
    }

    // Neutral indicators
    for (const word of NEUTRAL_INDICATORS) {
        if (lowerText.includes(word)) {
            neutralScore += 1;
        }
    }

    // Calculate sentiment
    const totalScore = positiveScore + negativeScore + neutralScore;
    let sentiment: Sentiment;
    let confidence: number;

    if (totalScore === 0) {
        sentiment = 'neutral';
        confidence = 0.5;
    } else if (positiveScore > negativeScore + neutralScore) {
        sentiment = 'positive';
        confidence = Math.min(positiveScore / totalScore, 1);
    } else if (negativeScore > positiveScore + neutralScore) {
        sentiment = 'negative';
        confidence = Math.min(negativeScore / totalScore, 1);
    } else {
        sentiment = 'neutral';
        confidence = Math.min(neutralScore / totalScore + 0.5, 1);
    }

    return {
        sentiment,
        confidence,
        positiveScore,
        negativeScore,
    };
}

/**
 * Simple sentiment analysis - returns just the sentiment
 */
export function analyzeSentiment(text: string): Sentiment {
    return analyzeSentimentDetailed(text).sentiment;
}

/**
 * Get the color for a sentiment
 */
export function getSentimentColor(sentiment: Sentiment): string {
    switch (sentiment) {
        case 'positive':
            return COLORS.success; // Green
        case 'negative':
            return COLORS.error;   // Red
        case 'neutral':
        default:
            return COLORS.info;    // Blue
    }
}

/**
 * Get gradient colors for a sentiment (for animated effects)
 */
export function getSentimentGradient(sentiment: Sentiment): [string, string] {
    switch (sentiment) {
        case 'positive':
            return [COLORS.success, COLORS.successDark];
        case 'negative':
            return [COLORS.error, COLORS.errorDark];
        case 'neutral':
        default:
            return [COLORS.info, COLORS.infoDark];
    }
}

/**
 * Get glow color for a sentiment
 */
export function getSentimentGlow(sentiment: Sentiment): string {
    switch (sentiment) {
        case 'positive':
            return COLORS.successGlow;
        case 'negative':
            return COLORS.errorGlow;
        case 'neutral':
        default:
            return COLORS.infoGlow;
    }
}
