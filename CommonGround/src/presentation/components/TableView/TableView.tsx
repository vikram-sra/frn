import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSession, generateId, TableEntry } from '../../context/SessionContext';
import { analyzeSentiment, getSentimentColor, Sentiment } from '../../../data/services/SentimentEngine';
import { redact } from '../../../data/services/RedactionEngine';
import { botController } from '../../../data/services/BotService';
import { saveSession, generateSessionId } from '../../../data/repositories/SessionRepository';
import { synthesisService } from '../../../data/services/SynthesisService';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    RADIUS,
    getCategoryColor,
    SHADOWS,
    GLASS_CARD,
    hexToRgba,
} from '../../theme';

const { width, height } = Dimensions.get('window');

interface TableViewProps {
    matchColor: string;
}

const MAX_INPUT_LENGTH = 500;

// ═══════════════════════════════════════════════════════════════
// 🌟 ANIMATED BACKGROUND PARTICLES
// ═══════════════════════════════════════════════════════════════
const BackgroundGlow = memo(() => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.6, duration: 3000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 3000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[styles.glowOrb, styles.glowOrbGreen, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.glowOrb, styles.glowOrbRed, { opacity: pulseAnim }]} />
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════
// 🌉 SYNTHESIS BRIDGE COMPONENT
// ═══════════════════════════════════════════════════════════════
const SynthesisBridge = memo(({ visible, insight }: { visible: boolean; insight: string }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.synthesisContainer, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={['rgba(168, 85, 247, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.bridgeGlow}
            />
            <View style={styles.synthesisCard}>
                <LinearGradient
                    colors={[hexToRgba(COLORS.glassBg, 0.9), hexToRgba(COLORS.glassBg, 0.95)]}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.synthesisIconContainer}>
                    <Text style={styles.synthesisIcon}>✨</Text>
                </View>
                <Text style={styles.synthesisTitle}>SYNTHESIS</Text>
                <Text style={styles.synthesisText}>{insight}</Text>
                <View style={styles.synthesisLine} />
            </View>
        </Animated.View>
    );
});

// ═══════════════════════════════════════════════════════════════
// 🎴 ANIMATED ENTRY CARD WITH GLASSMORPHISM
// ═══════════════════════════════════════════════════════════════
interface EntryCardProps {
    entry: TableEntry;
    isCommon: boolean;
    botName: string;
    index: number;
}

const EntryCard = memo(({ entry, isCommon, botName, index }: EntryCardProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const displayText = entry.author === 'bot' ? redact(entry.text) : entry.text;
    const accentColor = isCommon ? COLORS.success : COLORS.error;

    useEffect(() => {
        const delay = index * 50;
        const animation = Animated.parallel([
            Animated.spring(fadeAnim, { toValue: 1, tension: 80, friction: 10, delay, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, delay, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, delay, useNativeDriver: true }),
        ]);

        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                styles.entryContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                    borderColor: isCommon ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                },
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${entry.author === 'user' ? 'You' : botName} said: ${displayText}`}
        >
            <View style={[styles.glassBackground, { backgroundColor: isCommon ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }]} />

            {/* Accent gradient bar */}
            <LinearGradient
                colors={isCommon ? [COLORS.success, 'transparent'] : [COLORS.error, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.entryAccent}
            />

            <View style={styles.entryContent}>
                <Text style={styles.entryText}>{displayText}</Text>
                <View style={styles.entryMeta}>
                    <View style={[
                        styles.badge,
                        { backgroundColor: entry.author === 'user' ? hexToRgba(accentColor, 0.2) : 'rgba(0,0,0,0.3)' }
                    ]}>
                        <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
                        <Text style={[styles.badgeText, { color: entry.author === 'user' ? accentColor : COLORS.textSecondary }]}>
                            {entry.author === 'user' ? 'YOU' : botName}
                        </Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
});

// ═══════════════════════════════════════════════════════════════
// ⌨️ TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════
const TypingIndicator = memo(({ botName }: { botName: string }) => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
                ])
            ).start();
        };
        animateDot(dot1, 0);
        animateDot(dot2, 150);
        animateDot(dot3, 300);
    }, []);

    return (
        <View style={styles.typingContainer}>
            <Text style={styles.typingName}>{botName}</Text>
            <View style={styles.typingDots}>
                <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
                <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
                <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
            </View>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN TABLE VIEW
// ═══════════════════════════════════════════════════════════════
export default function TableView({ matchColor }: TableViewProps) {
    const { state, dispatch } = useSession();
    const [inputText, setInputText] = useState('');
    const [inputSentiment, setInputSentiment] = useState<Sentiment>('neutral');
    const [lastUserInput, setLastUserInput] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const [recentStatements, setRecentStatements] = useState<Set<string>>(new Set());
    const [synthesisInsight, setSynthesisInsight] = useState<string | null>(null);

    // Determines if synthesis should show
    useEffect(() => {
        if (state.commonalities.length >= 2 && state.differences.length >= 2) {
            const insight = synthesisService.getInsight(state.category, state.commonalities.length, state.differences.length);
            setSynthesisInsight(insight);
        }
    }, [state.commonalities.length, state.differences.length, state.category]);

    // Animation Values
    const leftDoorAnim = useRef(new Animated.Value(0)).current;
    const rightDoorAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const gutterGlowAnim = useRef(new Animated.Value(0.3)).current;
    const timerPulseAnim = useRef(new Animated.Value(1)).current;
    const timerGlowAnim = useRef(new Animated.Value(0)).current;
    const inputBorderAnim = useRef(new Animated.Value(2)).current;
    const sendButtonScale = useRef(new Animated.Value(1)).current;

    const scrollViewRefCommon = useRef<ScrollView>(null);
    const scrollViewRefDiff = useRef<ScrollView>(null);

    const categoryColor = getCategoryColor(state.category);
    const currentBot = botController.getCurrentBot();
    const sentimentColor = getSentimentColor(inputSentiment);

    // AI Pulse border animation
    useEffect(() => {
        if (inputText.length > 0) {
            const sentiment = analyzeSentiment(inputText);
            setInputSentiment(sentiment);

            if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
            }

            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.02, duration: 80, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0.6, duration: 120, useNativeDriver: false }),
                ]),
                Animated.sequence([
                    Animated.timing(gutterGlowAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
                    Animated.timing(gutterGlowAnim, { toValue: 0.5, duration: 150, useNativeDriver: false }),
                ]),
                Animated.sequence([
                    Animated.timing(inputBorderAnim, { toValue: 3, duration: 80, useNativeDriver: false }),
                    Animated.timing(inputBorderAnim, { toValue: 2, duration: 120, useNativeDriver: false }),
                ]),
            ]).start();
        } else {
            setInputSentiment('neutral');
            Animated.timing(glowAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
            Animated.timing(gutterGlowAnim, { toValue: 0.3, duration: 150, useNativeDriver: false }).start();
        }
    }, [inputText]);

    // Timer warning animation with DRAMATIC glow
    useEffect(() => {
        if (state.timerSeconds <= 15 && state.timerSeconds > 0 && state.phase === 'active') {
            const intensity = state.timerSeconds <= 5 ? 1.15 : 1.08;
            const speed = state.timerSeconds <= 5 ? 200 : 400;

            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(timerPulseAnim, { toValue: intensity, duration: speed, useNativeDriver: true }),
                        Animated.timing(timerGlowAnim, { toValue: 1, duration: speed, useNativeDriver: false }),
                    ]),
                    Animated.parallel([
                        Animated.timing(timerPulseAnim, { toValue: 1, duration: speed, useNativeDriver: true }),
                        Animated.timing(timerGlowAnim, { toValue: 0.3, duration: speed, useNativeDriver: false }),
                    ]),
                ])
            ).start();
        }
    }, [state.timerSeconds, state.phase]);

    // Auto-scroll
    useEffect(() => {
        setTimeout(() => scrollViewRefCommon.current?.scrollToEnd({ animated: true }), 100);
    }, [state.commonalities]);

    useEffect(() => {
        setTimeout(() => scrollViewRefDiff.current?.scrollToEnd({ animated: true }), 100);
    }, [state.differences]);

    // Function to trigger door open and verdict reveal
    const triggerDoorOpen = useCallback(() => {
        if (state.areDoorsOpen) return;

        dispatch({ type: 'OPEN_DOORS' });

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        const sessionData = {
            id: generateSessionId(),
            category: state.category,
            date: Date.now(),
            commonalities: state.commonalities.map(c => c.text),
            differences: state.differences.map(d => d.text),
            userStand: getFinalStand().stand as 'agreement' | 'opposition' | 'neutral',
        };
        saveSession(sessionData);

        // Epic door opening animation
        Animated.sequence([
            // Brief pause for dramatic effect
            Animated.delay(100),
            // Doors slide open with verdict fading in
            Animated.parallel([
                Animated.timing(leftDoorAnim, {
                    toValue: -width / 2 - 50,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(rightDoorAnim, {
                    toValue: width / 2 + 50,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [state.areDoorsOpen, state.category, state.commonalities, state.differences]);

    // Handle manual session end
    const handleEndSession = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        triggerDoorOpen();
    }, [triggerDoorOpen]);

    // Timer & Door Logic
    useEffect(() => {
        if (state.phase !== 'active') return;

        if (state.timerSeconds > 0) {
            const timer = setInterval(() => {
                dispatch({ type: 'UPDATE_TIMER', seconds: state.timerSeconds - 1 });
            }, 1000);
            return () => clearInterval(timer);
        } else if (state.timerSeconds === 0 && !state.areDoorsOpen) {
            triggerDoorOpen();
        }
    }, [state.timerSeconds, state.areDoorsOpen, state.phase, triggerDoorOpen]);

    // Bot Loop with typing indicator and duplicate prevention
    useEffect(() => {
        if (state.areDoorsOpen || state.phase !== 'active') return;

        const typingSpeed = botController.getTypingSpeed();

        const dumpInterval = setInterval(async () => {
            // Show typing indicator
            setIsTyping(true);

            // Random delay for more natural feel
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));

            const statement = await botController.getNextStatement(state.category, lastUserInput);

            // Prevent duplicate statements
            if (recentStatements.has(statement.text)) {
                setIsTyping(false);
                return;
            }

            setRecentStatements(prev => new Set([...prev, statement.text]));

            const entry: TableEntry = {
                id: generateId(),
                text: statement.text,
                author: 'bot',
                timestamp: Date.now(),
            };

            setIsTyping(false);

            if (statement.column === 'commonalities') {
                dispatch({ type: 'ADD_COMMONALITY', entry });
            } else {
                dispatch({ type: 'ADD_DIFFERENCE', entry });
            }
        }, typingSpeed);

        return () => clearInterval(dumpInterval);
    }, [dispatch, state.areDoorsOpen, state.phase, state.category, lastUserInput, recentStatements]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Button animation
        Animated.sequence([
            Animated.timing(sendButtonScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
            Animated.spring(sendButtonScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        ]).start();

        const sentiment = analyzeSentiment(inputText);
        const isCommon = sentiment === 'positive' || sentiment === 'neutral';

        const entry: TableEntry = {
            id: generateId(),
            text: inputText,
            author: 'user',
            timestamp: Date.now(),
        };

        if (isCommon) {
            dispatch({ type: 'ADD_COMMONALITY', entry });
        } else {
            dispatch({ type: 'ADD_DIFFERENCE', entry });
        }

        setLastUserInput(inputText);
        setInputText('');
    };

    const getFinalStand = () => {
        const total = state.commonalities.length + state.differences.length;
        const totalCommon = state.commonalities.length;
        const totalDiff = state.differences.length;

        if (total === 0) return {
            text: "QUIET START",
            stand: 'neutral',
            color: COLORS.textMuted,
            gradient: ['#64748B', '#475569'] as [string, string],
            sub: "No ground was broken yet.",
            emoji: "☁️"
        };

        const ratio = totalCommon / total;

        if (ratio > 0.6) return {
            text: "HARMONY REACHED",
            stand: 'agreement',
            color: COLORS.success,
            gradient: ['#10B981', '#059669'] as [string, string],
            sub: "Significant common ground identified.",
            emoji: "🤝"
        };

        if (ratio > 0.4 && ratio < 0.6) return {
            text: "NUANCED DIALOGUE",
            stand: 'neutral',
            color: COLORS.info,
            gradient: ['#3B82F6', '#2563EB'] as [string, string],
            sub: "A balanced exchange of perspectives.",
            emoji: "⚖️"
        };

        return {
            text: "PRODUCTIVE FRICTION",
            stand: 'opposition',
            color: COLORS.error,
            gradient: ['#F43F5E', '#BE123C'] as [string, string],
            sub: "More differences discovered than commonalities.",
            emoji: "⚔️"
        };
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleChallengeResponse = (wantsToTalk: boolean) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        if (wantsToTalk) {
            dispatch({ type: 'GO_TO_BOARD' });
        } else {
            dispatch({ type: 'RESET_SESSION' });
        }
    };

    const stand = getFinalStand();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Background */}
            <LinearGradient
                colors={['#030712', '#0F172A', '#030712']}
                style={StyleSheet.absoluteFill}
            />
            <BackgroundGlow />

            {/* SUMMARY OVERLAY - Full screen verdict reveal */}
            {state.areDoorsOpen && (
                <Animated.View
                    style={[
                        styles.summaryOverlay,
                        { opacity: fadeAnim }
                    ]}
                    pointerEvents="auto"
                >
                    <LinearGradient
                        colors={['#030712', '#0F172A', '#1E1B4B', '#0F172A', '#030712']}
                        locations={[0, 0.2, 0.5, 0.8, 1]}
                        style={StyleSheet.absoluteFill}
                    />

                    <View style={styles.verdictContent}>
                        <Animated.Text style={[styles.standEmoji, { transform: [{ scale: fadeAnim }] }]}>
                            {stand.emoji}
                        </Animated.Text>

                        <LinearGradient
                            colors={stand.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.standLabelContainer}
                        >
                            <Text style={styles.standLabel}>{stand.text}</Text>
                        </LinearGradient>

                        <Text style={styles.standSub}>{stand.sub}</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statBox}>
                                <Text style={[styles.statNumber, { color: COLORS.success }]}>
                                    {state.commonalities.length}
                                </Text>
                                <Text style={styles.statLabel}>COMMON</Text>
                            </View>

                            <View style={styles.ratioWrapper}>
                                <View style={styles.ratioBarBackground}>
                                    <View
                                        style={[
                                            styles.ratioBarFill,
                                            {
                                                width: `${(state.commonalities.length / (state.commonalities.length + state.differences.length || 1)) * 100}%`,
                                                backgroundColor: COLORS.success
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.ratioText}>BALANCE</Text>
                            </View>

                            <View style={styles.statBox}>
                                <Text style={[styles.statNumber, { color: COLORS.error }]}>
                                    {state.differences.length}
                                </Text>
                                <Text style={styles.statLabel}>DIFFERENT</Text>
                            </View>
                        </View>

                        <View style={styles.challengeBox}>
                            <Text style={styles.challengeTitle}>
                                Could you have a 5-minute conversation with this person?
                            </Text>
                            <View style={styles.challengeButtons}>
                                <TouchableOpacity
                                    style={styles.chalBtnYes}
                                    onPress={() => handleChallengeResponse(true)}
                                >
                                    <LinearGradient
                                        colors={[COLORS.accentPurple, COLORS.cosmicPurple]}
                                        style={styles.chalBtnGradient}
                                    >
                                        <Text style={styles.chalBtnText}>VIEW GLOBAL LEDGER</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.chalBtnNo}
                                    onPress={() => handleChallengeResponse(false)}
                                >
                                    <Text style={styles.chalBtnTextNo}>NEW CONVERSATION</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}

            {/* DOORS CONTAINER */}
            <View style={styles.doorsContainer} pointerEvents={state.areDoorsOpen ? 'none' : 'auto'}>
                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={['rgba(30,41,59,0.95)', 'rgba(15,23,42,0.98)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.categoryDot, { backgroundColor: categoryColor.primary }]} />
                            <Text style={styles.categoryLabel}>{state.category}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={styles.botPill}>
                                <View style={styles.botPillDot} />
                                <Text style={styles.botPillText}>{currentBot.name}</Text>
                            </View>
                            <Animated.View
                                style={[
                                    styles.timerContainer,
                                    state.timerSeconds <= 15 && styles.timerWarning,
                                    {
                                        transform: [{ scale: timerPulseAnim }],
                                        shadowColor: COLORS.error,
                                        shadowOpacity: timerGlowAnim,
                                        shadowRadius: 15,
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.timer,
                                    state.timerSeconds <= 15 && styles.timerTextWarning
                                ]}>
                                    {formatTime(state.timerSeconds)}
                                </Text>
                            </Animated.View>
                            {/* End Session Button */}
                            <TouchableOpacity
                                onPress={handleEndSession}
                                style={styles.endButton}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[hexToRgba(COLORS.warning, 0.9), hexToRgba(COLORS.warningDark, 0.9)]}
                                    style={styles.endButtonGradient}
                                >
                                    <Text style={styles.endButtonText}>END</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Column Headers */}
                <View style={styles.columnHeaders}>
                    <TouchableOpacity style={[styles.columnHeader, styles.columnHeaderGreen]} activeOpacity={0.8}>
                        <View style={styles.columnHeaderLeft}>
                            <Text style={styles.columnHeaderIcon}>✓</Text>
                            <Text style={[styles.columnHeaderText, { color: COLORS.success }]}>COMMON</Text>
                        </View>
                        <View style={[styles.countBadge, { backgroundColor: hexToRgba(COLORS.success, 0.2) }]}>
                            <Text style={[styles.columnCount, { color: COLORS.success }]}>
                                {state.commonalities.length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.columnHeader, styles.columnHeaderRed]} activeOpacity={0.8}>
                        <View style={styles.columnHeaderLeft}>
                            <Text style={styles.columnHeaderIcon}>✗</Text>
                            <Text style={[styles.columnHeaderText, { color: COLORS.error }]}>FRICTION</Text>
                        </View>
                        <View style={[styles.countBadge, { backgroundColor: hexToRgba(COLORS.error, 0.2) }]}>
                            <Text style={[styles.columnCount, { color: COLORS.error }]}>
                                {state.differences.length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Main Split Area */}
                <View style={styles.mainArea}>
                    {/* Green Column */}
                    <Animated.View style={[
                        styles.column,
                        styles.columnGreen,
                        { transform: [{ translateX: leftDoorAnim }] }
                    ]}>
                        <ScrollView
                            ref={scrollViewRefCommon}
                            style={styles.columnList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.columnContent}
                        >
                            {state.commonalities.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyEmoji}>🌱</Text>
                                    <Text style={styles.emptyTitle}>Common Ground</Text>
                                    <Text style={styles.emptyText}>Share agreements to plant seeds here</Text>
                                </View>
                            )}
                            {state.commonalities.map((entry, index) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    isCommon={true}
                                    botName={currentBot.name}
                                    index={index}
                                />
                            ))}
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </Animated.View>

                    {/* Center Bridge Area */}
                    <View style={styles.centerGutter} pointerEvents="none">
                        <SynthesisBridge visible={!!synthesisInsight && !state.areDoorsOpen} insight={synthesisInsight || ""} />

                        {!synthesisInsight && !state.areDoorsOpen && (
                            <Animated.View
                                style={[
                                    styles.gutterLine,
                                    {
                                        backgroundColor: inputText.length > 0 ? sentimentColor : categoryColor.primary,
                                        opacity: gutterGlowAnim,
                                    }
                                ]}
                            />
                        )}
                    </View>

                    {/* Red Column */}
                    <Animated.View style={[
                        styles.column,
                        styles.columnRed,
                        { transform: [{ translateX: rightDoorAnim }] }
                    ]}>
                        <ScrollView
                            ref={scrollViewRefDiff}
                            style={styles.columnList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.columnContent}
                        >
                            {state.differences.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyEmoji}>🔥</Text>
                                    <Text style={styles.emptyTitle}>Friction Points</Text>
                                    <Text style={styles.emptyText}>Express disagreements here</Text>
                                </View>
                            )}
                            {state.differences.map((entry, index) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    isCommon={false}
                                    botName={currentBot.name}
                                    index={index}
                                />
                            ))}
                            {isTyping && <TypingIndicator botName={currentBot.name} />}
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </Animated.View>
                </View>

                {/* Footer Input */}
                <View style={styles.footer}>
                    <LinearGradient
                        colors={['rgba(15,23,42,0.98)', 'rgba(30,41,59,1)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.footerContent}>
                        <Animated.View
                            style={[
                                styles.inputContainer,
                                {
                                    borderColor: sentimentColor,
                                    borderWidth: inputBorderAnim,
                                    transform: [{ scale: pulseAnim }],
                                    shadowColor: sentimentColor,
                                    shadowOpacity: glowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 0.6],
                                    }),
                                    shadowRadius: glowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 25],
                                    }),
                                }
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.sentimentDot,
                                    {
                                        backgroundColor: sentimentColor,
                                        transform: [{ scale: pulseAnim }],
                                        shadowColor: sentimentColor,
                                        shadowOpacity: 0.8,
                                        shadowRadius: 8,
                                    }
                                ]}
                            />
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Share your perspective..."
                                placeholderTextColor={COLORS.textMuted}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                                maxLength={MAX_INPUT_LENGTH}
                                accessibilityLabel="Message input field"
                                accessibilityHint={`Max ${MAX_INPUT_LENGTH} characters`}
                            />
                        </Animated.View>
                        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                            <TouchableOpacity
                                onPress={handleSend}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[sentimentColor, hexToRgba(sentimentColor, 0.8)]}
                                    style={styles.sendButton}
                                >
                                    <Text style={styles.sendButtonText}>↑</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🎨 STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    // New Glassmorphic Styles
    synthesisContainer: {
        position: 'absolute',
        top: '30%',
        left: -80,
        width: 180,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    bridgeGlow: {
        position: 'absolute',
        width: 400,
        height: 60,
        borderRadius: 30,
        opacity: 0.6,
    },
    synthesisCard: {
        width: 140,
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 60,
        ...SHADOWS.lg,
    },
    synthesisIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    synthesisIcon: {
        fontSize: 20,
    },
    synthesisTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.accentCyan,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    synthesisText: {
        fontSize: 11,
        color: COLORS.textPrimary,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '600',
    },
    synthesisLine: {
        width: 20,
        height: 2,
        backgroundColor: COLORS.accentPurple,
        marginTop: SPACING.sm,
        borderRadius: 1,
    },
    glassBackground: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    // End New Styles
    glowOrb: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowOrbGreen: {
        width: 200,
        height: 200,
        backgroundColor: COLORS.success,
        left: -50,
        top: '30%',
        opacity: 0.1,
    },
    glowOrbRed: {
        width: 200,
        height: 200,
        backgroundColor: COLORS.error,
        right: -50,
        top: '40%',
        opacity: 0.1,
    },
    doorsContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    header: {
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
        overflow: 'hidden',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryLabel: {
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    botPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: hexToRgba(COLORS.accentPurple, 0.15),
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: hexToRgba(COLORS.accentPurple, 0.3),
        gap: SPACING.xs,
    },
    botPillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accentPurple,
    },
    botPillText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightSemibold,
        color: COLORS.accentPurple,
    },
    timerContainer: {
        backgroundColor: COLORS.bgPrimary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        shadowOffset: { width: 0, height: 0 },
    },
    timerWarning: {
        backgroundColor: hexToRgba(COLORS.error, 0.15),
        borderColor: COLORS.error,
    },
    timer: {
        fontSize: TYPOGRAPHY.sizeLg,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        fontVariant: ['tabular-nums'],
    },
    timerTextWarning: {
        color: COLORS.error,
    },
    endButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    endButtonGradient: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endButtonText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    columnHeaders: {
        flexDirection: 'row',
    },
    columnHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    columnHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    columnHeaderIcon: {
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
    },
    columnHeaderGreen: {
        backgroundColor: hexToRgba(COLORS.success, 0.08),
        borderBottomWidth: 2,
        borderBottomColor: COLORS.success,
    },
    columnHeaderRed: {
        backgroundColor: hexToRgba(COLORS.error, 0.08),
        borderBottomWidth: 2,
        borderBottomColor: COLORS.error,
    },
    columnHeaderText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: TYPOGRAPHY.trackingWider,
    },
    countBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    columnCount: {
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
    },
    mainArea: {
        flex: 1,
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        overflow: 'hidden',
    },
    columnGreen: {
        backgroundColor: hexToRgba(COLORS.success, 0.04),
    },
    columnRed: {
        backgroundColor: hexToRgba(COLORS.error, 0.04),
    },
    centerGutter: {
        width: 6,
        backgroundColor: COLORS.bgPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 0 },
    },
    gutterLine: {
        width: 2,
        height: '100%',
    },
    columnList: {
        flex: 1,
    },
    columnContent: {
        padding: SPACING.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['4xl'],
        opacity: 0.7,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.sizeSm,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    entryContainer: {
        marginBottom: SPACING.md,
        borderRadius: RADIUS.lg,
        backgroundColor: 'rgba(0,0,0,0.25)',
        overflow: 'hidden',
    },
    entryAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    entryContent: {
        padding: SPACING.md,
        paddingLeft: SPACING.lg,
    },
    entryText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightMedium,
        marginBottom: SPACING.sm,
        lineHeight: TYPOGRAPHY.sizeMd * 1.5,
    },
    entryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        gap: SPACING.xs,
    },
    badgeDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    badgeText: {
        fontSize: TYPOGRAPHY.sizeXs,
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        opacity: 0.6,
        gap: SPACING.sm,
    },
    typingName: {
        fontSize: TYPOGRAPHY.sizeSm,
        color: COLORS.textMuted,
        fontStyle: 'italic',
    },
    typingDots: {
        flexDirection: 'row',
        gap: 4,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.textMuted,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.glassBorder,
        overflow: 'hidden',
    },
    footerContent: {
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgPrimary,
        borderRadius: RADIUS['2xl'],
        paddingHorizontal: SPACING.lg,
        height: 56,
        shadowOffset: { width: 0, height: 0 },
    },
    sentimentDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: SPACING.md,
        shadowOffset: { width: 0, height: 0 },
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizeMd,
        color: COLORS.textPrimary,
        height: '100%',
    },
    sendButton: {
        width: 56,
        height: 56,
        borderRadius: RADIUS['2xl'],
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    sendButtonText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.size2xl,
        fontWeight: TYPOGRAPHY.weightBold,
    },
    summaryOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    verdictContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    standEmoji: {
        fontSize: 80,
        marginBottom: SPACING.xl,
    },
    standLabelContainer: {
        paddingHorizontal: SPACING['3xl'],
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS['2xl'],
        marginBottom: SPACING.md,
    },
    standLabel: {
        fontSize: TYPOGRAPHY.size3xl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        textAlign: 'center',
        letterSpacing: TYPOGRAPHY.trackingWider,
    },
    standSub: {
        fontSize: TYPOGRAPHY.sizeLg,
        color: COLORS.textSecondary,
        marginBottom: SPACING['3xl'],
        fontWeight: TYPOGRAPHY.weightMedium,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING['3xl'],
        gap: SPACING['3xl'],
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: TYPOGRAPHY.size5xl,
        fontWeight: TYPOGRAPHY.weightBlack,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.sizeXs,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textMuted,
        letterSpacing: TYPOGRAPHY.trackingWidest,
        marginTop: SPACING.xs,
    },
    ratioWrapper: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    ratioBarBackground: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    ratioBarFill: {
        height: '100%',
    },
    ratioText: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '900',
        letterSpacing: 1,
    },
    statDivider: {
        width: 1,
        height: 60,
        backgroundColor: COLORS.glassBorder,
    },
    challengeBox: {
        ...GLASS_CARD,
        padding: SPACING['2xl'],
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    challengeTitle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizeLg,
        fontWeight: TYPOGRAPHY.weightSemibold,
        textAlign: 'center',
        marginBottom: SPACING['2xl'],
        lineHeight: TYPOGRAPHY.sizeLg * 1.5,
    },
    challengeButtons: {
        width: '100%',
        gap: SPACING.md,
    },
    chalBtnYes: {
        borderRadius: RADIUS['2xl'],
        overflow: 'hidden',
    },
    chalBtnGradient: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['2xl'],
        alignItems: 'center',
    },
    chalBtnNo: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['2xl'],
        borderRadius: RADIUS['2xl'],
        alignItems: 'center',
        backgroundColor: COLORS.glassBg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    chalBtnText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    chalBtnTextNo: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
});
