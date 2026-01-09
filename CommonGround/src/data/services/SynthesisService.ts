/**
 * Service to generate meaningful synthesis insights based on conversation data.
 */

interface SynthesisTemplate {
    category: string;
    insights: string[];
}

const SYNTHESIS_TEMPLATES: SynthesisTemplate[] = [
    {
        category: 'Modern Life',
        insights: [
            "Both value connection, but differ on methods.",
            "Shared goal: happiness. Different paths.",
            "Technology is a tool for both, used differently.",
            "Efficiency vs. Authenticity: a valid balance."
        ]
    },
    {
        category: 'Artificial Intelligence',
        insights: [
            "Innovation meets Caution: both are necessary.",
            "Humanity is central to both perspectives.",
            "Fear and Hope often walk together.",
            "Function over form, or form over function?"
        ]
    },
    {
        category: 'Social Media',
        insights: [
            "Connection is desired, isolation is feared.",
            "Privacy vs. Publicity: the eternal struggle.",
            "Real interactions valued by all.",
            "The medium shapes the message for everyone."
        ]
    },
    {
        category: 'Work Culture',
        insights: [
            "Productivity is key, but burnout is the enemy.",
            "Remote vs. Office: Trust is the core issue.",
            "Purpose drives us all, not just paychecks.",
            "Balance is the universal ambition."
        ]
    }
];

const GENERIC_INSIGHTS = [
    "Diverse views enrich the whole picture.",
    "Respect is the bridge between divides.",
    "Finding common ground requires looking deeper.",
    "Conflict often reveals shared passion."
];

class SynthesisService {
    getInsight(category: string, commonalitiesCount: number, differencesCount: number): string {
        // If we have very little data, return a generic starter
        if (commonalitiesCount < 2 && differencesCount < 2) {
            return "Building understanding...";
        }

        const template = SYNTHESIS_TEMPLATES.find(t => t.category === category);

        if (template) {
            return template.insights[Math.floor(Math.random() * template.insights.length)];
        }

        return GENERIC_INSIGHTS[Math.floor(Math.random() * GENERIC_INSIGHTS.length)];
    }
}

export const synthesisService = new SynthesisService();
