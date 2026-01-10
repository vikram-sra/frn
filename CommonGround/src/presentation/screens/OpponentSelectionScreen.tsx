import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSession } from '../context/SessionContext';
import { BOT_PERSONAS } from '../../data/services/BotService';
import { ParticleBackground } from '../components/ParticleBackground';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

/**
 * 👥 OPPONENT SELECTION SCREEN
 * Allows users to choose between a Human Match and various AI personas.
 */
export default function OpponentSelectionScreen() {
    const { dispatch } = useSession();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSelect = (opponent: string) => {
        dispatch({ type: 'SELECT_OPPONENT', opponent });
    };

    const options = [
        { name: 'Human Match', description: 'Connect with a real person anonymousaly.', icon: '🌍' },
        ...BOT_PERSONAS.map(bot => ({
            name: bot.name,
            description: bot.description,
            icon: bot.icon || '🤖'
        }))
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#030712', '#0F172A', '#030712']}
                style={StyleSheet.absoluteFill}
            />
            <ParticleBackground />

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                <View style={styles.stepDot} />
                <View style={styles.stepLine} />
                <View style={styles.stepDot} />
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, styles.stepActive]} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.eyebrow}>STEP 3: CHOOSE OPPONENT</Text>
                    <Text style={styles.title}>Who do you want{'\n'}to engage with?</Text>

                    <View style={styles.grid}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.name}
                                style={styles.card}
                                onPress={() => handleSelect(option.name)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                                    style={styles.cardGradient}
                                />
                                <Text style={styles.cardIcon}>{option.icon}</Text>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>{option.name.toUpperCase()}</Text>
                                    <Text style={styles.cardDescription}>{option.description}</Text>
                                </View>
                                <Text style={styles.arrow}>→</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => dispatch({ type: 'CONFIRM_IDENTITY' })}
                    >
                        <Text style={styles.backText}>← BACK TO TRENDS</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        paddingTop: 60,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    stepActive: {
        backgroundColor: COLORS.accentPurple,
        transform: [{ scale: 1.2 }],
    },
    stepLine: {
        width: 20,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    content: {
        paddingHorizontal: SPACING['2xl'],
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.accentCyan,
        letterSpacing: 3,
        marginBottom: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        lineHeight: 40,
        marginBottom: 32,
    },
    grid: {
        gap: SPACING.md,
    },
    card: {
        height: 100,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        ...SHADOWS.md,
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardIcon: {
        fontSize: 32,
        marginRight: SPACING.md,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        marginBottom: 4,
        letterSpacing: 1,
    },
    cardDescription: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
    arrow: {
        fontSize: 20,
        color: COLORS.accentPurple,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 40,
        alignSelf: 'center',
        padding: SPACING.md,
    },
    backText: {
        fontSize: 12,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textMuted,
        letterSpacing: 1.5,
    },
});
