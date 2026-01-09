import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSession, generateId, TableEntry } from '../../context/SessionContext';
import { analyzeSentiment } from '../../engines/SentimentEngine';
import { botController } from '../../bots/BotController';

interface TableViewProps {
    matchColor: string;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E', // Dark background for the gap
    },
    header: {
        backgroundColor: '#E5E5E5', // Light gray from image
        paddingHorizontal: 20,
        paddingVertical: 16,
        height: 100,
        justifyContent: 'space-between',
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4C1D95', // Deep purple
        textTransform: 'uppercase',
    },
    statusLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: '#4C1D95', // Deep purple
    },
    mainArea: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        gap: 10,
        backgroundColor: '#1E1E1E',
    },
    column: {
        flex: 1,
        borderRadius: 8,
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
    entryText: {
        color: '#fff',
        fontSize: 18, // Big readable text
        fontWeight: '600',
        marginBottom: 10,
        lineHeight: 24,
    },
    footer: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
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
});

export default function TableView({ matchColor }: TableViewProps) {
    const { state, dispatch } = useSession();
    const [inputText, setInputText] = useState('');
    const scrollViewRefCommon = useRef<ScrollView>(null);
    const scrollViewRefDiff = useRef<ScrollView>(null);

    // Auto-scroll on new items
    useEffect(() => {
        scrollViewRefCommon.current?.scrollToEnd({ animated: true });
    }, [state.commonalities]);

    useEffect(() => {
        scrollViewRefDiff.current?.scrollToEnd({ animated: true });
    }, [state.differences]);

    // Autonomous Bot Dumping Loop
    useEffect(() => {
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
        }, 4000); // New dump every 4 seconds

        return () => clearInterval(dumpInterval);
    }, [dispatch]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        // Auto-sort based on sentiment
        const sentiment = analyzeSentiment(inputText);

        // Default positive/neutral to Common, Negative to Diff
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

    return (
        <View style={styles.container}>
            {/* Reference-style Header */}
            <View style={styles.header}>
                <Text style={styles.categoryLabel}>CATEGORY</Text>
                <Text style={styles.statusLabel}>Connected with : Bot 1</Text>
            </View>

            {/* Main Split Area */}
            <View style={styles.mainArea}>
                {/* Green Column */}
                <View style={[styles.column, styles.columnGreen]}>
                    <ScrollView
                        ref={scrollViewRefCommon}
                        style={styles.columnList}
                    >
                        {state.commonalities.map((entry) => (
                            <Text key={entry.id} style={styles.entryText}>
                                {entry.text}
                            </Text>
                        ))}
                    </ScrollView>
                </View>

                {/* Red Column */}
                <View style={[styles.column, styles.columnRed]}>
                    <ScrollView
                        ref={scrollViewRefDiff}
                        style={styles.columnList}
                    >
                        {state.differences.map((entry) => (
                            <Text key={entry.id} style={styles.entryText}>
                                {entry.text}
                            </Text>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* Footer Input */}
            <View style={styles.footer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder=""
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendButtonText}>SEND</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
