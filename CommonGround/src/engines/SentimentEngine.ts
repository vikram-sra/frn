/**
 * Sentiment Analysis Engine
 * Determines sentiment for AI Pulse border coloring
 */

const POSITIVE_WORDS = [
    'agree', 'yes', 'same', 'absolutely', 'true', 'right', 'correct',
    'understand', 'see your point', 'makes sense', 'exactly', 'indeed',
    'definitely', 'certainly', 'of course', 'love', 'great', 'good'
];

const NEGATIVE_WORDS = [
    'no', 'disagree', 'wrong', 'never', 'false', 'incorrect', 'but',
    'however', 'actually', 'different', 'oppose', 'against', 'hate',
    'bad', 'terrible', 'awful', 'nonsense', 'ridiculous'
];

export type Sentiment = 'positive' | 'negative' | 'neutral';

export function analyzeSentiment(text: string): Sentiment {
    const lowerText = text.toLowerCase();

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of POSITIVE_WORDS) {
        if (lowerText.includes(word)) {
            positiveScore++;
        }
    }

    for (const word of NEGATIVE_WORDS) {
        if (lowerText.includes(word)) {
            negativeScore++;
        }
    }

    if (positiveScore > negativeScore) {
        return 'positive';
    } else if (negativeScore > positiveScore) {
        return 'negative';
    }

    return 'neutral';
}

export function getSentimentColor(sentiment: Sentiment): string {
    switch (sentiment) {
        case 'positive':
            return '#22C55E'; // Green
        case 'negative':
            return '#EF4444'; // Red
        case 'neutral':
        default:
            return '#3B82F6'; // Blue
    }
}
