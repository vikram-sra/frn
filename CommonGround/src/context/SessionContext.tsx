import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface TableEntry {
    id: string;
    text: string;
    author: 'user' | 'bot';
    timestamp: number;
}

export interface SessionState {
    isMatched: boolean;
    matchColor: string | null;
    category: string;
    commonalities: TableEntry[];
    differences: TableEntry[];
    chatMessages: Array<{
        id: string;
        text: string;
        author: 'user' | 'bot';
        timestamp: number;
    }>;
    sessionStartTime: number | null;
    timerSeconds: number;
    currentBotType: 'mirror' | 'devils_advocate' | 'silent_observer' | 'toxic';
}

// Actions
type SessionAction =
    | { type: 'SET_MATCHED'; color: string }
    | { type: 'RESET_SESSION' }
    | { type: 'SET_CATEGORY'; category: string }
    | { type: 'ADD_COMMONALITY'; entry: TableEntry }
    | { type: 'ADD_DIFFERENCE'; entry: TableEntry }
    | { type: 'ADD_CHAT_MESSAGE'; message: SessionState['chatMessages'][0] }
    | { type: 'UPDATE_TIMER'; seconds: number }
    | { type: 'SET_BOT_TYPE'; botType: SessionState['currentBotType'] };

// Initial State
const initialState: SessionState = {
    isMatched: false,
    matchColor: null,
    category: 'General',
    commonalities: [],
    differences: [],
    chatMessages: [],
    sessionStartTime: null,
    timerSeconds: 300, // 5 minutes default
    currentBotType: 'mirror',
};

// Reducer
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
    switch (action.type) {
        case 'SET_MATCHED':
            return {
                ...state,
                isMatched: true,
                matchColor: action.color,
                sessionStartTime: Date.now(),
            };
        case 'RESET_SESSION':
            return initialState;
        case 'SET_CATEGORY':
            return { ...state, category: action.category };
        case 'ADD_COMMONALITY':
            return { ...state, commonalities: [...state.commonalities, action.entry] };
        case 'ADD_DIFFERENCE':
            return { ...state, differences: [...state.differences, action.entry] };
        case 'ADD_CHAT_MESSAGE':
            return { ...state, chatMessages: [...state.chatMessages, action.message] };
        case 'UPDATE_TIMER':
            return { ...state, timerSeconds: action.seconds };
        case 'SET_BOT_TYPE':
            return { ...state, currentBotType: action.botType };
        default:
            return state;
    }
}

// Context
interface SessionContextType {
    state: SessionState;
    dispatch: React.Dispatch<SessionAction>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Provider
export function SessionProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(sessionReducer, initialState);

    return (
        <SessionContext.Provider value={{ state, dispatch }}>
            {children}
        </SessionContext.Provider>
    );
}

// Hook
export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

// Helper to generate unique IDs
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
