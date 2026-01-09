/**
 * Base Bot Interface
 */
export interface Bot {
    name: string;
    generateIndependentStatement(): Promise<{
        text: string;
        column: 'commonalities' | 'differences';
    }>;
}

// Topic Statements by Category
const TOPIC_STATEMENTS: Record<string, string[]> = {
    "Modern Life": [
        "Remote work is more productive than office work",
        "Social media does more harm than good",
        "Cities are becoming unlivable",
        "Privacy is dead in the digital age",
        "The 4-day work week should be standard",
    ],
    "Artificial Intelligence": [
        "AI will solve more problems than it creates",
        "AI art is not real art",
        "We are moving towards a post-labor society",
        "AI should be heavily regulated",
        "Human creativity is irreplaceable",
    ],
    "Social Media": [
        "Algorithms control our opinions",
        "Social media creates echo chambers",
        "Influencer culture is toxic",
        "We vary rarely connect authentically online",
        "Digital detox is necessary for mental health",
    ],
    "Work Culture": [
        "Hustle culture is damaging",
        "Meetings could be emails",
        "Work-life balance is a myth",
        "Offices are obsolete",
        "Loyalty to companies is unrewarded",
    ],
    "Climate Action": [
        "Individual action is meaningless without policy",
        "Nuclear energy is essential",
        "Electric cars are not the solution",
        "We need to consume less, not just green",
        "Climate change is the biggest threat",
    ],
    "Digital Privacy": [
        "Privacy is a human right",
        "Data collection should be opt-in",
        "Surveillance capitalism is the norm",
        "Encryption is vital for freedom",
        "We have already lost the privacy war",
    ],
    "Education Reform": [
        "Standardized testing is useless",
        "College is too expensive",
        "We need more vocational training",
        "Schools kill creativity",
        "Education should be lifelong",
    ],
    "Future of Cities": [
        "Cars should be banned from city centers",
        "Public transport should be free",
        "Vertical farming is the future",
        "Cities need more green spaces",
        "Suburbs are unsustainable",
    ]
};

/**
 * Universal Dumper Bot - Randomly generated opinions
 */
export class DumperBot implements Bot {
    name: string;
    topic: string; // Current topic

    constructor(name: string, topic: string = "Modern Life") {
        this.name = name;
        this.topic = topic;
    }

    async generateIndependentStatement() {
        // Get statements for current topic, fallback to Modern Life if not found
        const statements = TOPIC_STATEMENTS[this.topic] || TOPIC_STATEMENTS["Modern Life"];

        // Pick a random statement
        const statement = statements[Math.floor(Math.random() * statements.length)];

        // Pick a random side (50/50 split for demo purposes)
        const isCommon = Math.random() > 0.5;

        return {
            text: statement,
            column: isCommon ? 'commonalities' as const : 'differences' as const,
        };
    }

    setTopic(topic: string) {
        this.topic = topic;
    }
}

/**
 * Bot Controller - Manages autonomous dumping
 */
export class BotController {
    private currentBot: DumperBot;

    constructor() {
        this.currentBot = new DumperBot("Bot 1");
    }

    // Update topic
    setTopic(topic: string) {
        this.currentBot.setTopic(topic);
    }

    // Get a statement immediately (no more simulation of typing delay here, view handles timing)
    async getNextStatement() {
        return this.currentBot.generateIndependentStatement();
    }
}

export const botController = new BotController();
