/**
 * 🌐 LIVE TRENDS SERVICE
 * Fetches real-time trending topics from Google Trends RSS
 * Transforms raw trends into debate-worthy questions
 */

// ═══════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════
export interface TrendingTopic {
    id: string;
    title: string;
    debateQuestion: string;
    traffic: string;
    description?: string;
    newsUrl?: string;
    imageUrl?: string;
    category: string;
    timestamp: number;
}

export interface TrendsState {
    topics: TrendingTopic[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 DEBATE QUESTION TRANSFORMERS
// ═══════════════════════════════════════════════════════════════
const DEBATE_TEMPLATES = [
    (topic: string) => `Should ${topic} be more regulated?`,
    (topic: string) => `Is ${topic} ultimately good for society?`,
    (topic: string) => `Has ${topic} gone too far?`,
    (topic: string) => `Do the benefits of ${topic} outweigh the risks?`,
    (topic: string) => `Should we be concerned about ${topic}?`,
    (topic: string) => `Is the hype around ${topic} justified?`,
    (topic: string) => `Will ${topic} change the world for better or worse?`,
    (topic: string) => `Is ${topic} overrated or underrated?`,
];

function transformToDebateQuestion(trend: string): string {
    const template = DEBATE_TEMPLATES[Math.floor(Math.random() * DEBATE_TEMPLATES.length)];
    return template(trend);
}

// ═══════════════════════════════════════════════════════════════
// 🏷️ CATEGORY CLASSIFIER
// ═══════════════════════════════════════════════════════════════
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "Artificial Intelligence": ["ai", "gpt", "openai", "chatgpt", "machine learning", "robot", "automation", "llm", "deepfake"],
    "Social Media": ["tiktok", "instagram", "twitter", "x.com", "facebook", "meta", "influencer", "viral", "youtube"],
    "Work Culture": ["remote work", "layoff", "hiring", "ceo", "strike", "union", "salary", "job", "career", "quiet quitting"],
    "Climate Action": ["climate", "environment", "carbon", "solar", "wind", "ev", "electric vehicle", "sustainability", "pollution"],
    "Digital Privacy": ["privacy", "data", "hack", "breach", "surveillance", "encryption", "tiktok ban", "spy"],
    "Education Reform": ["college", "university", "school", "student", "teacher", "tuition", "degree", "education"],
    "Future of Cities": ["housing", "rent", "city", "urban", "transit", "traffic", "zoning", "homeless"],
    "Modern Life": [], // Default category
};

function classifyCategory(text: string): string {
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            return category;
        }
    }
    return "Modern Life";
}

// ═══════════════════════════════════════════════════════════════
// 🌐 RSS FETCHING (via CORS proxy for web)
// ═══════════════════════════════════════════════════════════════

// Multiple CORS proxies as fallback
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
];

const GOOGLE_TRENDS_RSS = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';

async function fetchWithProxy(url: string): Promise<string> {
    for (const proxy of CORS_PROXIES) {
        try {
            const response = await fetch(proxy + encodeURIComponent(url), {
                headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' }
            });
            if (response.ok) {
                return await response.text();
            }
        } catch (e) {
            console.warn(`Proxy ${proxy} failed, trying next...`);
        }
    }
    throw new Error('All CORS proxies failed');
}

function parseRSSXML(xmlText: string): TrendingTopic[] {
    const topics: TrendingTopic[] = [];

    // Simple XML parsing for RSS items
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

    itemMatches.slice(0, 15).forEach((item, index) => {
        const getTag = (tag: string): string => {
            const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
            // Handle CDATA
            if (match) {
                return match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
            }
            return '';
        };

        const title = getTag('title') || getTag('ht:news_item_title');
        const traffic = getTag('ht:approx_traffic') || '10K+';
        const description = getTag('ht:news_item_snippet') || getTag('description');
        const newsUrl = getTag('ht:news_item_url') || getTag('link');
        const picture = item.match(/<ht:picture>([^<]+)<\/ht:picture>/)?.[1] || '';

        if (title) {
            topics.push({
                id: `trend-${index}-${Date.now()}`,
                title: title,
                debateQuestion: transformToDebateQuestion(title),
                traffic: traffic,
                description: description,
                newsUrl: newsUrl,
                imageUrl: picture,
                category: classifyCategory(title + ' ' + description),
                timestamp: Date.now(),
            });
        }
    });

    return topics;
}

// ═══════════════════════════════════════════════════════════════
// 📦 FALLBACK TOPICS (when RSS fails)
// ═══════════════════════════════════════════════════════════════
const FALLBACK_TOPICS: TrendingTopic[] = [
    {
        id: 'fallback-1',
        title: 'AI in the Workplace',
        debateQuestion: 'Should AI be allowed to replace human jobs?',
        traffic: '500K+',
        category: 'Artificial Intelligence',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-2',
        title: 'Social Media Algorithms',
        debateQuestion: 'Are social media algorithms destroying democracy?',
        traffic: '200K+',
        category: 'Social Media',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-3',
        title: 'Remote Work Debate',
        debateQuestion: 'Is remote work better than going to the office?',
        traffic: '300K+',
        category: 'Work Culture',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-4',
        title: 'Climate Emergency',
        debateQuestion: 'Should we ban fossil fuels immediately?',
        traffic: '400K+',
        category: 'Climate Action',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-5',
        title: 'Data Privacy Laws',
        debateQuestion: 'Should all data collection require explicit opt-in?',
        traffic: '150K+',
        category: 'Digital Privacy',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-6',
        title: 'College Tuition Crisis',
        debateQuestion: 'Should college education be free for everyone?',
        traffic: '250K+',
        category: 'Education Reform',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-7',
        title: 'Housing Affordability',
        debateQuestion: 'Should cities ban single-family zoning?',
        traffic: '180K+',
        category: 'Future of Cities',
        timestamp: Date.now(),
    },
    {
        id: 'fallback-8',
        title: 'Screen Time for Kids',
        debateQuestion: 'Should smartphones be banned for teenagers?',
        traffic: '350K+',
        category: 'Modern Life',
        timestamp: Date.now(),
    },
];

// ═══════════════════════════════════════════════════════════════
// 🔌 MAIN SERVICE API
// ═══════════════════════════════════════════════════════════════

class TrendsService {
    private cache: TrendingTopic[] = [];
    private lastFetch: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async fetchTrendingTopics(): Promise<TrendingTopic[]> {
        // Return cached if fresh
        if (this.cache.length > 0 && Date.now() - this.lastFetch < this.CACHE_DURATION) {
            return this.cache;
        }

        try {
            console.log('🌐 Fetching live Google Trends...');
            const xmlText = await fetchWithProxy(GOOGLE_TRENDS_RSS);
            const topics = parseRSSXML(xmlText);

            if (topics.length > 0) {
                this.cache = topics;
                this.lastFetch = Date.now();
                console.log(`✅ Loaded ${topics.length} live trends`);
                return topics;
            }
        } catch (error) {
            console.warn('⚠️ Failed to fetch live trends, using fallback:', error);
        }

        // Return fallback topics
        console.log('📦 Using fallback topics');
        return FALLBACK_TOPICS;
    }

    getTopicsByCategory(category: string): TrendingTopic[] {
        if (category === 'All' || !category) {
            return this.cache.length > 0 ? this.cache : FALLBACK_TOPICS;
        }
        const filtered = (this.cache.length > 0 ? this.cache : FALLBACK_TOPICS)
            .filter(t => t.category === category);
        return filtered.length > 0 ? filtered : FALLBACK_TOPICS;
    }

    getAllCategories(): string[] {
        return [
            'All',
            'Modern Life',
            'Artificial Intelligence',
            'Social Media',
            'Work Culture',
            'Climate Action',
            'Digital Privacy',
            'Education Reform',
            'Future of Cities',
        ];
    }

    getFallbackTopics(): TrendingTopic[] {
        return FALLBACK_TOPICS;
    }
}

export const trendsService = new TrendsService();
