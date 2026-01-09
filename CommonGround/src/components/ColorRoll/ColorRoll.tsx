import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    Text,
    Platform,
} from 'react-native';

const { height } = Dimensions.get('window');

// Generate random hex color
const randomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Vibrant color palette for final match
const MATCH_COLORS = [
    '#10B981', // Emerald
    '#3B82F6', // Electric Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
];

interface ColorRollProps {
    onMatch: (color: string) => void;
}

export default function ColorRoll({ onMatch }: ColorRollProps) {
    const [userColor, setUserColor] = useState('#000000');
    const [strangerColor, setStrangerColor] = useState('#333333');
    const [isSearching, setIsSearching] = useState(true);
    const [matchColor, setMatchColor] = useState<string | null>(null);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Slower, bolder color cycling effect
    useEffect(() => {
        if (!isSearching) return;

        const userInterval = setInterval(() => {
            setUserColor(randomColor());
        }, 1000); // Slower 1s interval

        const strangerInterval = setInterval(() => {
            setStrangerColor(randomColor());
        }, 1200); // Slightly offset

        // Match after 4 seconds
        const matchTimeout = setTimeout(() => {
            clearInterval(userInterval);
            clearInterval(strangerInterval);

            const finalColor = MATCH_COLORS[Math.floor(Math.random() * MATCH_COLORS.length)];
            setMatchColor(finalColor);
            setUserColor(finalColor);
            setStrangerColor(finalColor);
            setIsSearching(false);

            // Trigger match callback after animation
            setTimeout(() => {
                onMatch(finalColor);
            }, 2000);
        }, 4000);

        return () => {
            clearInterval(userInterval);
            clearInterval(strangerInterval);
            clearTimeout(matchTimeout);
        };
    }, [isSearching, onMatch]);

    // Pulse animation when matched
    useEffect(() => {
        if (!matchColor) return;

        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Fade in "MATCHED" text
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [matchColor, pulseAnim, fadeAnim]);

    return (
        <View style={styles.container}>
            {/* Top Half - User */}
            <Animated.View
                style={[
                    styles.halfScreen,
                    { backgroundColor: userColor },
                    { transform: [{ scale: pulseAnim }] },
                ]}
            >
                <Text style={styles.label}>YOU</Text>
                {isSearching && <Text style={styles.statusText}>SEARCHING...</Text>}
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
                {matchColor && (
                    <Animated.View style={[styles.matchBadge, { opacity: fadeAnim }]}>
                        <Text style={styles.matchText}>MATCHED</Text>
                    </Animated.View>
                )}
            </View>

            {/* Bottom Half - Stranger */}
            <Animated.View
                style={[
                    styles.halfScreen,
                    { backgroundColor: strangerColor },
                    { transform: [{ scale: pulseAnim }] },
                ]}
            >
                <Text style={styles.label}>OTHERS</Text>
                {isSearching && (
                    <View style={styles.blurOverlay}>
                        <Text style={styles.statusText}>CONNECTING...</Text>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    halfScreen: {
        height: height / 2 - 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 8,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    label: {
        fontSize: 60,
        fontWeight: '900',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    statusText: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 20,
        fontWeight: '700',
        letterSpacing: 4,
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchBadge: {
        position: 'absolute',
        backgroundColor: '#fff',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 50,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    matchText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
});
