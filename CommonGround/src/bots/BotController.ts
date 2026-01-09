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

// Topic Statements for "Modern Life"
const TOPIC_STATEMENTS = [
    "Remote work is more productive than office work",
    "Social media does more harm than good",
    "AI will solve more problems than it creates",
    "Universal basic income is inevitable",
    "Cities are becoming unlivable",
    "Privacy is dead in the digital age",
    "Education needs a complete overhaul",
    "Healthcare should be free for everyone",
    "Climate change is the biggest threat we face",
    "Traditional 9-5 jobs are obsolete",
    "Smartphones have ruined social interaction",
    "Cryptocurrency is the future of money",
    "Space exploration is a waste of resources",
    "Nuclear energy is necessary for green future",
    "Meat consumption must be reduced",
    "Mental health is a global crisis",
    "College degrees are losing value",
    "Automation will take most jobs",
    "The 4-day work week should be standard",
    "Public transport should be free",
];

/**
 * Universal Dumper Bot - Randomly generated opinions
 */
export class DumperBot implements Bot {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    async generateIndependentStatement() {
        // Pick a random statement
        const statement = TOPIC_STATEMENTS[Math.floor(Math.random() * TOPIC_STATEMENTS.length)];

        // Pick a random side (50/50 split for demo purposes)
        const isCommon = Math.random() > 0.5;

        return {
            text: statement,
            column: isCommon ? 'commonalities' as const : 'differences' as const,
        };
    }
}

/**
 * Bot Controller - Manages autonomous dumping
 */
export class BotController {
    private currentBot: Bot;

    constructor() {
        this.currentBot = new DumperBot("Bot 1");
    }

    // Get a statement immediately (no more simulation of typing delay here, view handles timing)
    async getNextStatement() {
        return this.currentBot.generateIndependentStatement();
    }
}

export const botController = new BotController();
