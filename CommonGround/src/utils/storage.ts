/**
 * AsyncStorage wrapper for session persistence
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedSession {
    id: string;
    category: string;
    date: number;
    commonalities: string[];
    differences: string[];
    userStand: 'agreement' | 'opposition' | 'neutral';
}

const STORAGE_KEY = '@common_ground_sessions';

/**
 * Save a completed session to storage
 */
export async function saveSession(session: SavedSession): Promise<void> {
    try {
        const existing = await getSessions();
        const updated = [session, ...existing].slice(0, 50); // Keep last 50 sessions
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save session:', error);
    }
}

/**
 * Retrieve all saved sessions
 */
export async function getSessions(): Promise<SavedSession[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load sessions:', error);
        return [];
    }
}

/**
 * Clear all saved sessions
 */
export async function clearSessions(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear sessions:', error);
    }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
