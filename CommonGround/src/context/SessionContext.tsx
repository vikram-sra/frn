import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface TableEntry {
    id: string;
    text: string;
    author: 'user' | 'bot';
    timestamp: number;
}

export interface ChatMessage {
    id: string;
    text: string;
    author: 'user' | 'bot';
    timestamp: number;
}

export interface SessionState {
    phase: 'category_select' | 'matching' | 'active' | 'summary';
    category: string;
    commonalities: TableEntry[];
    differences: TableEntry[];
    chatMessages: ChatMessage[];
    timerSeconds: number;
    areDoorsOpen: boolean; // New state
}

// Actions
type Action =
    | { type: 'SET_CATEGORY'; category: string }
    | { type: 'START_MATCH' }
    | { type: 'START_SESSION' }
    | { type: 'UPDATE_TIMER'; seconds: number }
    | { type: 'ADD_COMMONALITY'; entry: TableEntry }
    | { type: 'ADD_DIFFERENCE'; entry: TableEntry }
    | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
    | { type: 'OPEN_DOORS' } // New action
    | { type: 'RESET_SESSION' };

// Initial State
const initialState: SessionState = {
    phase: 'category_select', // Start here now
    category: 'Modern Life',
    timerSeconds: 300, // 5 minutes
    commonalities: [],
    differences: [],
    chatMessages: [],
    areDoorsOpen: false, // New state
};

// Reducer
function sessionReducer(state: SessionState, action: Action): SessionState {
    switch (action.type) {
        case 'SET_CATEGORY':
            return { ...state, category: action.category, phase: 'matching' };
        case 'START_MATCH':
            return { ...state, phase: 'matching' };
        case 'START_SESSION':
            return { ...initialState, category: state.category, phase: 'active' };
        case 'UPDATE_TIMER':
            return { ...state, timerSeconds: action.seconds };
        case 'ADD_COMMONALITY':
            return { ...state, commonalities: [...state.commonalities, action.entry] };
        case 'ADD_DIFFERENCE':
            return { ...state, differences: [...state.differences, action.entry] };
        case 'ADD_CHAT_MESSAGE':
            return { ...state, chatMessages: [...state.chatMessages, action.message] };
        case 'OPEN_DOORS':
            return { ...state, areDoorsOpen: true };
        case 'RESET_SESSION':
            return initialState;
        default:
            return state;
    }
}

// Context
interface SessionContextType {
    state: SessionState;
    dispatch: React.Dispatch<Action>;
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
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}
