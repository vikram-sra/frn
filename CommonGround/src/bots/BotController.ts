/**
 * 🤖 BOT PERSONAS FOR COMMON GROUND
 * Each bot has distinct behavior patterns for testing UX
 * Creates realistic conversation dynamics
 */

import { COLORS } from '../constants/theme';

// ═══════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════
export interface Bot {
    name: string;
    typingSpeed: number;
    personality: string;
    emoji: string;
    generateStatement(category: string, userLastInput?: string): Promise<{
        text: string;
        column: 'commonalities' | 'differences';
    }>;
}

// ═══════════════════════════════════════════════════════════════
// 📚 TOPIC STATEMENTS BY CATEGORY
// ═══════════════════════════════════════════════════════════════
const TOPIC_STATEMENTS: Record<string, { agree: string[]; disagree: string[] }> = {
    "Modern Life": {
        agree: [
            "Work-life balance is essential for wellbeing",
            "Technology should enhance, not replace human connection",
            "Mental health awareness has improved society",
            "Flexibility in work arrangements benefits everyone",
            "Sustainable living is worth the effort",
            "We all deserve access to quality healthcare",
            "Community connections matter more than ever",
            "Self-care isn't selfish, it's necessary",
        ],
        disagree: [
            "Remote work is more productive than office work",
            "Social media does more harm than good",
            "Cities are becoming unlivable",
            "Privacy is dead in the digital age",
            "The 4-day work week should be standard",
            "Hustle culture is toxic and unsustainable",
            "We're more disconnected than ever before",
            "Modern life is fundamentally overwhelming",
        ],
    },
    "Artificial Intelligence": {
        agree: [
            "AI can be a powerful tool when used responsibly",
            "Human oversight is essential for AI systems",
            "AI should augment human capabilities",
            "Ethical considerations must guide AI development",
            "Transparency in AI decision-making is important",
            "AI literacy should be taught in schools",
            "Collaboration between humans and AI is the future",
        ],
        disagree: [
            "AI will replace most human jobs within a decade",
            "AI-generated art is not real art",
            "We're moving too fast with AI development",
            "AI should be heavily regulated by governments",
            "Human creativity is irreplaceable by machines",
            "AI companies care more about profit than safety",
            "The AI hype is mostly just marketing",
        ],
    },
    "Social Media": {
        agree: [
            "Social media can connect distant communities",
            "Platform accountability is necessary",
            "We need better digital literacy education",
            "Authentic connection is possible online",
            "Social media amplifies important movements",
            "Online communities can be genuinely supportive",
        ],
        disagree: [
            "Algorithms completely control our opinions",
            "Social media creates dangerous echo chambers",
            "Influencer culture is entirely toxic",
            "We rarely connect authentically online anymore",
            "Digital detox is mandatory for mental health",
            "Social media is designed to be addictive",
        ],
    },
    "Work Culture": {
        agree: [
            "Fair compensation is a basic right",
            "Healthy work environments boost productivity",
            "Career growth opportunities matter",
            "Collaboration is essential for innovation",
            "Employee wellbeing affects business outcomes",
            "Diversity in the workplace benefits everyone",
        ],
        disagree: [
            "Hustle culture is fundamentally damaging",
            "Most meetings could be emails",
            "Work-life balance is a myth in practice",
            "Traditional offices are becoming obsolete",
            "Company loyalty rarely pays off anymore",
            "Performance reviews are often meaningless",
        ],
    },
    "Climate Action": {
        agree: [
            "Climate change is a serious global challenge",
            "Renewable energy is the path forward",
            "Conservation efforts matter for future generations",
            "Sustainable practices benefit everyone",
            "Environmental education is crucial",
            "We have a responsibility to protect nature",
        ],
        disagree: [
            "Individual action is meaningless without policy change",
            "Nuclear energy is the only realistic solution",
            "Electric cars alone won't solve the problem",
            "We must consume less, not just buy green",
            "Corporations deserve more blame than consumers",
            "It might already be too late for meaningful action",
        ],
    },
    "Digital Privacy": {
        agree: [
            "Everyone deserves some level of privacy",
            "Data security is increasingly important",
            "Companies should protect user information",
            "Privacy laws have improved over time",
            "Education about privacy matters",
            "We should have control over our own data",
        ],
        disagree: [
            "Privacy is a fundamental human right being violated daily",
            "All data collection should be opt-in only",
            "Surveillance capitalism is dangerously normalized",
            "Encryption should be unbreakable by anyone",
            "We've already lost the privacy war",
            "Tech companies know too much about us",
        ],
    },
    "Education Reform": {
        agree: [
            "Education opens doors to opportunity",
            "Teachers deserve more support and pay",
            "Learning should be engaging and relevant",
            "Critical thinking skills are essential",
            "Access to quality education matters",
            "Lifelong learning is increasingly important",
        ],
        disagree: [
            "Standardized testing is counterproductive",
            "College is prohibitively expensive",
            "We need far more vocational training options",
            "Schools systematically stifle creativity",
            "The entire education system needs rebuilding",
            "Traditional grades don't measure real learning",
        ],
    },
    "Future of Cities": {
        agree: [
            "Cities offer unique opportunities",
            "Urban planning affects quality of life",
            "Public spaces bring communities together",
            "Infrastructure investment is essential",
            "Cities can be sustainable",
            "Walkable neighborhoods improve health",
        ],
        disagree: [
            "Cars should be banned from city centers",
            "All public transport should be free",
            "Vertical farming must replace traditional agriculture",
            "Cities need far more green spaces",
            "Suburbs are fundamentally unsustainable",
            "Housing costs are completely out of control",
        ],
    },
};

// Paraphrase mappings for Mirror Bot
const PARAPHRASES: Record<string, string> = {
    "agree": "I resonate with that",
    "disagree": "I have a different perspective",
    "think": "I believe",
    "feel": "I sense",
    "important": "significant",
    "should": "could potentially",
    "must": "might benefit from",
};

// ═══════════════════════════════════════════════════════════════
// 🤖 BOT IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Echo Bot - Mirrors and agrees with user
 */
export class MirrorBot implements Bot {
    name = "Echo";
    typingSpeed = 3500;
    personality = "Agreeable and affirming";
    emoji = "🪞";

    async generateStatement(category: string, userLastInput?: string) {
        const statements = TOPIC_STATEMENTS[category] || TOPIC_STATEMENTS["Modern Life"];

        if (userLastInput) {
            let mirrored = userLastInput;
            Object.entries(PARAPHRASES).forEach(([key, value]) => {
                mirrored = mirrored.replace(new RegExp(key, 'gi'), value);
            });
            return {
                text: `That resonates with me - ${mirrored.toLowerCase()}`,
                column: 'commonalities' as const,
            };
        }

        const statement = statements.agree[Math.floor(Math.random() * statements.agree.length)];
        return {
            text: statement,
            column: 'commonalities' as const,
        };
    }
}

/**
 * Contrarian Bot - Always finds counterpoints
 */
export class DevilsAdvocateBot implements Bot {
    name = "Contrarian";
    typingSpeed = 2800;
    personality = "Challenging and provocative";
    emoji = "😈";

    async generateStatement(category: string, _userLastInput?: string) {
        const statements = TOPIC_STATEMENTS[category] || TOPIC_STATEMENTS["Modern Life"];

        // 75% differences, 25% commonalities
        const isDisagreement = Math.random() > 0.25;

        if (isDisagreement) {
            const statement = statements.disagree[Math.floor(Math.random() * statements.disagree.length)];
            return {
                text: statement,
                column: 'differences' as const,
            };
        } else {
            const statement = statements.agree[Math.floor(Math.random() * statements.agree.length)];
            return {
                text: `I'll concede that ${statement.toLowerCase()}`,
                column: 'commonalities' as const,
            };
        }
    }
}

/**
 * Thoughtful Bot - Speaks rarely, balanced perspective
 */
export class SilentObserverBot implements Bot {
    name = "Sage";
    typingSpeed = 5500;
    personality = "Contemplative and balanced";
    emoji = "🧘";

    private statementCount = 0;

    async generateStatement(category: string, _userLastInput?: string) {
        const statements = TOPIC_STATEMENTS[category] || TOPIC_STATEMENTS["Modern Life"];

        this.statementCount++;
        const isCommon = this.statementCount % 2 === 0;

        const pool = isCommon ? statements.agree : statements.disagree;
        const statement = pool[Math.floor(Math.random() * pool.length)];

        const prefixes = ["Perhaps...", "Hmm,", "Considering this...", "It seems that", "One could argue", "Interestingly,"];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        return {
            text: `${prefix} ${statement.toLowerCase()}`,
            column: isCommon ? 'commonalities' as const : 'differences' as const,
        };
    }
}

/**
 * Challenger Bot - Tests the Live Redaction Engine
 */
export class ToxicBot implements Bot {
    name = "Provocateur";
    typingSpeed = 2200;
    personality = "Provocative but filtered";
    emoji = "🔥";

    private toxicStatements = [
        "That's a really stupid argument",
        "Only an idiot would believe that",
        "You're such a fool for thinking that way",
        "That's the dumbest thing I've heard today",
        "What a moron would say!",
        "Stop being such a jerk about it",
        "That's loser talk right there",
        "You're pathetic for believing that",
    ];

    private normalStatements = [
        "I strongly disagree with your position",
        "That's an interesting but flawed perspective",
        "I think you're missing the bigger picture",
        "Let me challenge that assumption",
        "That's a narrow way to look at it",
    ];

    async generateStatement(category: string, _userLastInput?: string) {
        // 65% toxic (to test redaction), 35% normal
        const isToxic = Math.random() > 0.35;

        const statement = isToxic
            ? this.toxicStatements[Math.floor(Math.random() * this.toxicStatements.length)]
            : this.normalStatements[Math.floor(Math.random() * this.normalStatements.length)];

        return {
            text: statement,
            column: 'differences' as const,
        };
    }
}

/**
 * Balanced Bot - Standard balanced responses
 */
export class BalancedBot implements Bot {
    name = "Diplomat";
    typingSpeed = 4000;
    personality = "Fair and balanced";
    emoji = "⚖️";

    async generateStatement(category: string, _userLastInput?: string) {
        const statements = TOPIC_STATEMENTS[category] || TOPIC_STATEMENTS["Modern Life"];

        const isCommon = Math.random() > 0.5;
        const pool = isCommon ? statements.agree : statements.disagree;
        const statement = pool[Math.floor(Math.random() * pool.length)];

        return {
            text: statement,
            column: isCommon ? 'commonalities' as const : 'differences' as const,
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 📋 BOT REGISTRY
// ═══════════════════════════════════════════════════════════════
export const BOT_PERSONAS = [
    { id: 'mirror', name: 'Echo', description: 'Finds common ground', emoji: '🪞', Bot: MirrorBot },
    { id: 'advocate', name: 'Contrarian', description: 'Challenges your views', emoji: '😈', Bot: DevilsAdvocateBot },
    { id: 'observer', name: 'Sage', description: 'Balanced perspective', emoji: '🧘', Bot: SilentObserverBot },
    { id: 'toxic', name: 'Provocateur', description: 'Tests redaction filter', emoji: '🔥', Bot: ToxicBot },
    { id: 'balanced', name: 'Diplomat', description: 'Fair and balanced', emoji: '⚖️', Bot: BalancedBot },
];

// ═══════════════════════════════════════════════════════════════
// 🎮 BOT CONTROLLER
// ═══════════════════════════════════════════════════════════════
export class BotController {
    private currentBot: Bot;

    constructor() {
        this.currentBot = this.selectRandomBot();
    }

    selectRandomBot(): Bot {
        const bots = [
            new MirrorBot(),
            new DevilsAdvocateBot(),
            new SilentObserverBot(),
            new ToxicBot(),
            new BalancedBot(),
        ];
        return bots[Math.floor(Math.random() * bots.length)];
    }

    setBot(botType: 'mirror' | 'advocate' | 'observer' | 'toxic' | 'balanced') {
        switch (botType) {
            case 'mirror':
                this.currentBot = new MirrorBot();
                break;
            case 'advocate':
                this.currentBot = new DevilsAdvocateBot();
                break;
            case 'observer':
                this.currentBot = new SilentObserverBot();
                break;
            case 'toxic':
                this.currentBot = new ToxicBot();
                break;
            case 'balanced':
                this.currentBot = new BalancedBot();
                break;
        }
    }

    getCurrentBot(): Bot {
        return this.currentBot;
    }

    getTypingSpeed(): number {
        return this.currentBot.typingSpeed;
    }

    async getNextStatement(category: string, userLastInput?: string) {
        return this.currentBot.generateStatement(category, userLastInput);
    }

    resetBot() {
        this.currentBot = this.selectRandomBot();
    }

    getAllBots() {
        return BOT_PERSONAS;
    }
}

export const botController = new BotController();
