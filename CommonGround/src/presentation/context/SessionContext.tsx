import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════
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

export interface UserIdentity {
    id: string;
    name: string;
    avatarEmoji: string;
    trait: string;
}

export type AppPhase = 'identity_reveal' | 'category_select' | 'matching' | 'active' | 'summary' | 'board';

export interface SessionState {
    phase: AppPhase;
    userIdentity: UserIdentity | null;
    category: string;
    commonalities: TableEntry[];
    differences: TableEntry[];
    chatMessages: ChatMessage[];
    timerSeconds: number;
    areDoorsOpen: boolean;
    botName: string;
    matchColor: string;
}

// ═══════════════════════════════════════════════════════════════
// 🎬 ACTIONS
// ═══════════════════════════════════════════════════════════════
type Action =
    | { type: 'SET_IDENTITY'; identity: UserIdentity }
    | { type: 'CONFIRM_IDENTITY' }
    | { type: 'SET_CATEGORY'; category: string }
    | { type: 'START_MATCH' }
    | { type: 'START_SESSION'; botName?: string; matchColor?: string }
    | { type: 'UPDATE_TIMER'; seconds: number }
    | { type: 'ADD_COMMONALITY'; entry: TableEntry }
    | { type: 'ADD_DIFFERENCE'; entry: TableEntry }
    | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
    | { type: 'OPEN_DOORS' }
    | { type: 'GO_TO_BOARD' }
    | { type: 'RESET_SESSION' };

// ═══════════════════════════════════════════════════════════════
// 🏁 INITIAL STATE
// ═══════════════════════════════════════════════════════════════
const initialState: SessionState = {
    phase: 'identity_reveal',
    userIdentity: null,
    category: 'Modern Life',
    timerSeconds: 90, // 1.5 minutes for engaging demo
    commonalities: [],
    differences: [],
    chatMessages: [],
    areDoorsOpen: false,
    botName: 'Bot',
    matchColor: '#A855F7',
};

// ═══════════════════════════════════════════════════════════════
// 🔄 REDUCER
// ═══════════════════════════════════════════════════════════════
function sessionReducer(state: SessionState, action: Action): SessionState {
    switch (action.type) {
        case 'SET_IDENTITY':
            return {
                ...state,
                userIdentity: action.identity
            };

        case 'CONFIRM_IDENTITY':
            return {
                ...state,
                phase: 'category_select'
            };

        case 'SET_CATEGORY':
            return {
                ...state,
                category: action.category
            };

        case 'START_MATCH':
            return {
                ...state,
                phase: 'matching'
            };

        case 'START_SESSION':
            return {
                ...initialState,
                userIdentity: state.userIdentity, // Preserve identity
                category: state.category,
                phase: 'active',
                botName: action.botName || 'Bot',
                matchColor: action.matchColor || '#A855F7',
            };

        case 'UPDATE_TIMER':
            return {
                ...state,
                timerSeconds: action.seconds
            };

        case 'ADD_COMMONALITY':
            return {
                ...state,
                commonalities: [...state.commonalities, action.entry]
            };

        case 'ADD_DIFFERENCE':
            return {
                ...state,
                differences: [...state.differences, action.entry]
            };

        case 'ADD_CHAT_MESSAGE':
            return {
                ...state,
                chatMessages: [...state.chatMessages, action.message]
            };

        case 'OPEN_DOORS':
            return {
                ...state,
                areDoorsOpen: true,
                phase: 'summary'
            };

        case 'GO_TO_BOARD':
            return {
                ...state,
                phase: 'board'
            };

        case 'RESET_SESSION':
            return initialState;

        default:
            return state;
    }
}

// ═══════════════════════════════════════════════════════════════
// 🌐 CONTEXT
// ═══════════════════════════════════════════════════════════════
interface SessionContextType {
    state: SessionState;
    dispatch: React.Dispatch<Action>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// 🎁 PROVIDER
// ═══════════════════════════════════════════════════════════════
export function SessionProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(sessionReducer, initialState);

    return (
        <SessionContext.Provider value={{ state, dispatch }}>
            {children}
        </SessionContext.Provider>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🪝 HOOK
// ═══════════════════════════════════════════════════════════════
export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

// ═══════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ═══════════════════════════════════════════════════════════════
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
