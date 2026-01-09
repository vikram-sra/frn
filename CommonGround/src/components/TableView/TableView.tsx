import React, { useEffect, useState, useRef } from 'react';
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
import { useSession, generateId, TableEntry } from '../../context/SessionContext';
import { analyzeSentiment } from '../../engines/SentimentEngine';
import { botController } from '../../bots/BotController';

const { width } = Dimensions.get('window');

interface TableViewProps {
    matchColor: string;
}

export default function TableView({ matchColor }: TableViewProps) {
    const { state, dispatch } = useSession();
    const [inputText, setInputText] = useState('');

    // Animation Values
    const leftDoorAnim = useRef(new Animated.Value(0)).current;
    const rightDoorAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current; // For the summary card

    const scrollViewRefCommon = useRef<ScrollView>(null);
    const scrollViewRefDiff = useRef<ScrollView>(null);

    // Set Bot Topic on Mount
    useEffect(() => {
        botController.setTopic(state.category);
    }, [state.category]);

    // Auto-scroll logic
    useEffect(() => {
        scrollViewRefCommon.current?.scrollToEnd({ animated: true });
    }, [state.commonalities]);

    useEffect(() => {
        scrollViewRefDiff.current?.scrollToEnd({ animated: true });
    }, [state.differences]);

    // Timer & Door Logic
    useEffect(() => {
        if (state.timerSeconds > 0) {
            const timer = setInterval(() => {
                dispatch({ type: 'UPDATE_TIMER', seconds: state.timerSeconds - 1 });
            }, 1000);
            return () => clearInterval(timer);
        } else if (state.timerSeconds === 0 && !state.areDoorsOpen) {
            // Timer ended, Open Doors!
            dispatch({ type: 'OPEN_DOORS' });

            Animated.parallel([
                Animated.timing(leftDoorAnim, {
                    toValue: -width / 2, // Slide left out of screen
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(rightDoorAnim, {
                    toValue: width / 2, // Slide right out of screen
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1, // Fade in summary
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [state.timerSeconds, state.areDoorsOpen, dispatch]);

    // Autonomous Bot Dumping Loop (Stops when doors open)
    useEffect(() => {
        if (state.areDoorsOpen) return;

        const dumpInterval = setInterval(async () => {
            const statement = await botController.getNextStatement();

            const entry: TableEntry = {
                id: generateId(),
                text: statement.text,
                author: 'bot',
                timestamp: Date.now(),
            };

            if (statement.column === 'commonalities') {
                dispatch({ type: 'ADD_COMMONALITY', entry });
            } else {
                dispatch({ type: 'ADD_DIFFERENCE', entry });
            }
        }, 4000);

        return () => clearInterval(dumpInterval);
    }, [dispatch, state.areDoorsOpen]);

    const handleSend = () => {
        if (!inputText.trim()) return;

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

        setInputText('');
    };

    const getFinalStand = () => {
        const userCommon = state.commonalities.filter(e => e.author === 'user').length;
        const userDiff = state.differences.filter(e => e.author === 'user').length;

        if (userCommon > userDiff) return { text: "IN AGREEMENT", color: '#10B981', sub: "You found common ground." };
        if (userDiff > userCommon) return { text: "IN OPPOSITION", color: '#EF4444', sub: "You stood your ground." };
        return { text: "NEUTRAL", color: '#3B82F6', sub: "You see both sides." };
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const stand = getFinalStand();

    return (
        <View style={styles.container}>
            {/* BACKGROUND SUMMARY CARD (Reveal) */}
            <Animated.View style={[styles.summaryOverlay, { opacity: fadeAnim }]}>
                <Text style={[styles.standLabel, { color: stand.color }]}>{stand.text}</Text>
                <Text style={styles.standSub}>{stand.sub}</Text>

                <View style={styles.challengeBox}>
                    <Text style={styles.challengeTitle}>Could you have a 5-minute conversation with this person?</Text>
                    <View style={styles.challengeButtons}>
                        <TouchableOpacity style={[styles.chalBtn, { backgroundColor: '#10B981' }]}>
                            <Text style={styles.chalBtnText}>YES</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.chalBtn, { backgroundColor: '#EF4444' }]}>
                            <Text style={styles.chalBtnText}>NO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>


            {/* DOORS CONTAINER */}
            <View style={styles.doorsContainer} pointerEvents={state.areDoorsOpen ? 'none' : 'auto'}>
                {/* Header */}
                <Animated.View style={[styles.header, { transform: [{ translateY: state.areDoorsOpen ? -150 : 0 }] }]}>
                    <Text style={styles.categoryLabel}>{state.category}</Text>
                    <Text style={styles.timer}>{formatTime(state.timerSeconds)}</Text>
                </Animated.View>

                {/* Main Split Area */}
                <View style={styles.mainArea}>
                    {/* Green Column (Left Door) */}
                    <Animated.View style={[styles.column, styles.columnGreen, { transform: [{ translateX: leftDoorAnim }] }]}>
                        <ScrollView ref={scrollViewRefCommon} style={styles.columnList}>
                            {state.commonalities.map((entry) => (
                                <View key={entry.id} style={styles.entryContainer}>
                                    <Text style={styles.entryText}>{entry.text}</Text>
                                    <View style={[styles.badge, entry.author === 'user' ? styles.badgeUser : styles.badgeBot]}>
                                        <Text style={styles.badgeText}>{entry.author === 'user' ? 'YOU' : 'BOT 1'}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Red Column (Right Door) */}
                    <Animated.View style={[styles.column, styles.columnRed, { transform: [{ translateX: rightDoorAnim }] }]}>
                        <ScrollView ref={scrollViewRefDiff} style={styles.columnList}>
                            {state.differences.map((entry) => (
                                <View key={entry.id} style={styles.entryContainer}>
                                    <Text style={styles.entryText}>{entry.text}</Text>
                                    <View style={[styles.badge, entry.author === 'user' ? styles.badgeUser : styles.badgeBot]}>
                                        <Text style={styles.badgeText}>{entry.author === 'user' ? 'YOU' : 'BOT 1'}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </View>

                {/* Footer (slides down on open) */}
                <Animated.View style={[styles.footer, { transform: [{ translateY: state.areDoorsOpen ? 150 : 0 }] }]}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder=""
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>SEND</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E', // Dark background for the gap
        position: 'relative',
    },
    header: {
        backgroundColor: '#E5E5E5', // Light gray from image
        paddingHorizontal: 20,
        paddingVertical: 16,
        height: 100,
        justifyContent: 'space-between',
        zIndex: 10,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4C1D95', // Deep purple
        textTransform: 'uppercase',
    },
    timer: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4C1D95',
    },
    statusLabel: { // Keeping for legacy reference in logic but not used in new design
        fontSize: 18,
        fontWeight: '500',
        color: '#4C1D95',
    },
    mainArea: {
        flex: 1,
        flexDirection: 'row',
        padding: 0, // No padding for full doors
        gap: 0, // No gap for full doors
        backgroundColor: '#1E1E1E',
    },
    column: {
        flex: 1,
        overflow: 'hidden',
    },
    columnGreen: {
        backgroundColor: '#558B5E', // Muted green from image
    },
    columnRed: {
        backgroundColor: '#C24B4B', // Muted red from image
    },
    columnList: {
        padding: 10,
    },
    entryContainer: {
        marginBottom: 16,
    },
    entryText: {
        color: '#fff',
        fontSize: 18, // Big readable text
        fontWeight: '600',
        marginBottom: 6,
        lineHeight: 24,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeUser: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    badgeBot: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
        zIndex: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#D4D4D4',
        height: '100%',
        borderRadius: 4,
        paddingHorizontal: 16,
        fontSize: 18,
        color: '#000',
        marginRight: 16,
    },
    sendButton: {
        backgroundColor: '#262626', // Dark button
        height: '100%',
        aspectRatio: 1.5,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    doorsContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1, // Ensure doors are above summary but below header/footer when open
    },
    summaryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0, // Behind the doors initially
        padding: 20,
    },
    standLabel: {
        fontSize: 48,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
        // textShadowColor: 'rgba(0, 0, 0, 0.75)',
        // textShadowOffset: { width: -1, height: 1 },
        // textShadowRadius: 10,
    },
    standSub: {
        fontSize: 20,
        color: '#D4D4D4',
        marginBottom: 40,
        fontWeight: '500',
    },
    challengeBox: {
        backgroundColor: '#262626',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    challengeTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    challengeButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    chalBtn: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    chalBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
