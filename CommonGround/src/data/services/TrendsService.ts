/**
 * 🌐 LIVE TRENDS SERVICE (RSS-BASED) - ENHANCED
 * Unified service to fetch trending topics via Google Trends RSS.
 * Support for Daily vs Real-time feeds.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════
export interface TrendingTopic {
    id: string;
    title: string;
    debateQuestion: string;
    traffic: string; // "High" or "100K+" etc
    description?: string;
    newsUrl?: string;
    imageUrl?: string;
    category: string;
    source: 'daily' | 'realtime';
    timestamp: number;
}

export type TrendRegion = 'US' | 'GB' | 'CA' | 'AU' | 'IN' | 'JP' | 'FR' | 'BR' | 'DE' | 'IT';
export type TrendCategory = 'all' | 'b' | 'e' | 't' | 'm' | 'h';
export type FeedType = 'daily' | 'realtime';
export type LanguageCode = 'en-US' | 'es-ES';

export const TREND_CATEGORIES: { label: string, value: TrendCategory }[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Business', value: 'b' },
    { label: 'Entertainment', value: 'e' },
    { label: 'Sci/Tech', value: 't' },
    { label: 'Sports', value: 'm' },
    { label: 'Health', value: 'h' },
];

export interface TrendsConfig {
    region: TrendRegion;
    category: TrendCategory;
    feedType: FeedType;
    hl: LanguageCode;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 DEBATE QUESTION TRANSFORMERS (Dynamic & Engaging)
// ═══════════════════════════════════════════════════════════════
const DEBATE_TEMPLATES = [
    (topic: string) => `Does the impact of ${topic} improve human Connection?`,
    (topic: string) => `Is the cultural obsession with ${topic} sustainable?`,
    (topic: string) => `Should public policy prioritize ${topic} over economy?`,
    (topic: string) => `Is ${topic} the defining problem of our generation?`,
    (topic: string) => `Has the media exaggerated the importance of ${topic}?`,
    (topic: string) => `Will ${topic} lead to more polarized communities?`,
    (topic: string) => `Is the rapid evolution of ${topic} outpacing our ethics?`,
    (topic: string) => `Do we rely too heavily on ${topic} for social validation?`,
    (topic: string) => `Should access to ${topic} be considered a human right?`,
    (topic: string) => `Is ${topic} bridge the gap between opposing worldviews?`,
];

function transformToDebateQuestion(trend: string): string {
    const template = DEBATE_TEMPLATES[Math.floor(Math.random() * DEBATE_TEMPLATES.length)];
    return template(trend);
}

// ═══════════════════════════════════════════════════════════════
// 🌐 NETWORK UTILS
// ═══════════════════════════════════════════════════════════════
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/',
];

const CACHE_KEY = '@cg_trends_rss_cache_v2';

class TrendsService {
    private cache: TrendingTopic[] = [];
    private lastFetch: number = 0;

    /**
     * Constructs the RSS URL based on EXACT mapping provided
     */
    getTargetUrl(config: TrendsConfig): string {
        const { region, category, feedType, hl } = config;
        const basePath = feedType === 'realtime' ? 'realtime' : 'daily';
        const catKey = feedType === 'realtime' ? 'category' : 'cat';

        return `https://trends.google.com/trends/trendingsearches/${basePath}/rss?geo=${region}&${catKey}=${category}&hl=${hl}`;
    }

    async fetchTrendingTopics(config: TrendsConfig): Promise<TrendingTopic[]> {
        const url = this.getTargetUrl(config);
        return this.fetchByUrl(url);
    }

    async fetchByUrl(url: string, categoryLabel = 'Trending'): Promise<TrendingTopic[]> {
        console.log(`📡 URL: ${url}`);

        try {
            const xmlText = await this.fetchWithRetry(url);
            const topics = this.parseGenericRSS(xmlText, categoryLabel);

            if (topics.length > 0) {
                this.cache = topics;
                this.lastFetch = Date.now();
                return topics;
            }
        } catch (error) {
            console.error('❌ Fetch failed:', error);
        }
        return this.getFallbackTopics();
    }

    private async fetchWithRetry(url: string, retries = 2): Promise<string> {
        const encodedUrl = encodeURIComponent(url);
        // Direct attempt
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) return await res.text();
        } catch (e) {
            console.log('⏩ Direct fetch blocked (CORS). Rotating proxies...');
        }

        // Proxy rotation
        for (const proxy of CORS_PROXIES) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 6000);
                const res = await fetch(proxy + encodedUrl, { signal: controller.signal });
                clearTimeout(timeout);
                if (res.ok) return await res.text();
            } catch (e) { }
        }
        throw new Error('RSS Sync Error');
    }

    private parseGenericRSS(xmlText: string, categoryLabel: string): TrendingTopic[] {
        const topics: TrendingTopic[] = [];
        const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

        itemMatches.forEach((item, index) => {
            const getTag = (tag: string): string => {
                const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
                return match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
            };

            const title = getTag('title');
            const traffic = getTag('ht:approx_traffic') || 'Trending';

            if (title) {
                topics.push({
                    id: `rss-${index}-${Date.now()}`,
                    title,
                    debateQuestion: transformToDebateQuestion(title),
                    traffic: traffic,
                    category: categoryLabel,
                    source: xmlText.includes('realtime') ? 'realtime' : 'daily',
                    timestamp: Date.now(),
                    description: getTag('description'),
                });
            }
        });

        return topics;
    }

    private parseRSSXML(xmlText: string, config: TrendsConfig): TrendingTopic[] {
        const categoryLabel = TREND_CATEGORIES.find(c => c.value === config.category)?.label || 'Trending';
        return this.parseGenericRSS(xmlText, categoryLabel);
    }

    getRegions(): { label: string, value: TrendRegion }[] {
        return [
            { label: 'United States', value: 'US' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Canada', value: 'CA' },
            { label: 'Australia', value: 'AU' },
            { label: 'India', value: 'IN' },
            { label: 'Japan', value: 'JP' },
            { label: 'France', value: 'FR' },
            { label: 'Brazil', value: 'BR' },
            { label: 'Germany', value: 'DE' },
            { label: 'Italy', value: 'IT' },
        ];
    }

    getFallbackTopics(): TrendingTopic[] {
        const fallbacks: any[] = [
            { title: 'Global Markets', traffic: '2M+', cat: 'Business' },
            { title: 'AI Ethics', traffic: '1M+', cat: 'Tech' },
            { title: 'Space Exploration', traffic: '500K+', cat: 'Sci/Tech' },
            { title: 'Climate Summit', traffic: '800K+', cat: 'Top Stories' },
            { title: 'Championship Finals', traffic: '1.2M+', cat: 'Sports' },
            { title: 'Mental Health Awareness', traffic: '250K+', cat: 'Health' },
            { title: 'Crypto Regulation', traffic: '700K+', cat: 'Finance' },
            { title: 'Quantum Computing', traffic: '150K+', cat: 'Technology' },
            { title: 'Sustainable Energy', traffic: '400K+', cat: 'Environment' },
            { title: 'Remote Work Trends', traffic: '900K+', cat: 'Lifestyle' },
            { title: 'Olympic Preparations', traffic: '2M+', cat: 'Sports' },
            { title: 'Genetic Engineering', traffic: '300K+', cat: 'Science' },
            { title: 'Global Supply Chain', traffic: '1.5M+', cat: 'Business' },
            { title: 'Digital Privacy', traffic: '600K+', cat: 'Tech' },
            { title: 'Renaissance in Art', traffic: '100K+', cat: 'Entertainment' },
        ];

        return fallbacks.map((f, i) => ({
            id: `f-${i}`,
            title: f.title,
            debateQuestion: transformToDebateQuestion(f.title),
            traffic: f.traffic,
            category: f.cat,
            source: 'daily',
            timestamp: Date.now()
        }));
    }
}

export const trendsService = new TrendsService();
