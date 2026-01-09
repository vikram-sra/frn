export interface UserIdentity {
    id: string;
    name: string;
    avatarEmoji: string;
    trait: string;
}

const ADJECTIVES = [
    "Logical", "Stoic", "Curious", "Empathic", "Rational",
    "Mindful", "Objective", "Diplomatic", "Analytical", "Creative"
];

const ANIMALS = [
    "Panda", "Eagle", "Dolphin", "Owl", "Fox",
    "Lion", "Elephant", "Falcon", "Wolf", "Bear"
];

const TRAITS = [
    "Seeker of Truth", "Bridge Builder", "Pattern Recognizer",
    "Calm Observer", "Devil's Advocate", "Peace Maker"
];

const EMOJIS: Record<string, string> = {
    "Panda": "🐼", "Eagle": "🦅", "Dolphin": "🐬", "Owl": "🦉",
    "Fox": "🦊", "Lion": "🦁", "Elephant": "🐘", "Falcon": "🦅",
    "Wolf": "🐺", "Bear": "🐻"
};

class IdentityService {
    generateIdentity(): UserIdentity {
        const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        const trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];

        return {
            id: `user-${Date.now()}`,
            name: `${adjective}${animal}`,
            avatarEmoji: EMOJIS[animal] || "👤",
            trait: trait
        };
    }
}

export const identityService = new IdentityService();
