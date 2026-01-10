import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSession } from '../context/SessionContext';
import { identityService } from '../../data/services/IdentityService';
import { ParticleBackground } from '../components/ParticleBackground';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

/**
 * 👤 IDENTITY REVEAL SCREEN
 * Generates and presents a pseudonym to the user.
 * Ensures privacy and encourages free expression.
 */
export default function IdentityRevealScreen() {
    const { dispatch } = useSession();
    const [identity, setIdentity] = useState(identityService.generateIdentity());

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.8)).current;
    const emojiScale = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Set identity in context
        dispatch({ type: 'SET_IDENTITY', identity });

        // 🎬 Entrance Sequence
        const entrance = Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.parallel([
                Animated.spring(pulseAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
                Animated.spring(emojiScale, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        ]);

        entrance.start();

        return () => {
            entrance.stop();
        };
    }, []);

    const handleContinue = () => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        dispatch({ type: 'CONFIRM_IDENTITY' });
    };

    const handleShuffle = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Quick shuffle animation
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        const newId = identityService.generateIdentity();
        setIdentity(newId);
        dispatch({ type: 'SET_IDENTITY', identity: newId });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#030712', '#1E1B4B', '#030712']}
                style={StyleSheet.absoluteFill}
            />

            <ParticleBackground />

            {/* Step Progress */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, styles.stepActive]} />
                <View style={styles.stepLine} />
                <View style={styles.stepDot} />
                <View style={styles.stepLine} />
                <View style={styles.stepDot} />
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Animated.Text
                    style={[styles.eyebrow, { transform: [{ translateY: slideAnim }] }]}
                    accessibilityRole="header"
                >
                    YOUR DIGITAL AVATAR
                </Animated.Text>

                {/* Identity Card */}
                <Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient
                        colors={['rgba(168, 85, 247, 0.2)', 'rgba(6, 182, 212, 0.1)']}
                        style={styles.cardGradient}
                    />

                    <Animated.Text
                        style={[styles.emoji, { transform: [{ scale: emojiScale }] }]}
                        accessibilityLabel={`Emoji: ${identity.avatarEmoji}`}
                    >
                        {identity.avatarEmoji}
                    </Animated.Text>

                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.name}>{identity.name}</Text>
                        <Text style={styles.trait}>{identity.trait.toUpperCase()}</Text>
                    </Animated.View>
                </Animated.View>

                <Animated.Text style={[styles.description, { opacity: fadeAnim }]}>
                    This pseudonym protects your identity, allowing you to speak freely without judgment.
                </Animated.Text>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Next: Choose Topic"
                        accessibilityHint="Transitions to trend selection screen"
                    >
                        <LinearGradient
                            colors={['#A855F7', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.continueGradient}
                        >
                            <Text style={styles.continueText}>NEXT: CHOOSE TOPIC</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.shuffleButton}
                        onPress={handleShuffle}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Shuffle Persona"
                        accessibilityHint="Generates a new random pseudonym"
                    >
                        <Text style={styles.shuffleText}>SHUFFLE PERSONA</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: SPACING['2xl'],
        paddingTop: 40,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    stepActive: {
        backgroundColor: COLORS.accentPurple,
        width: 24,
    },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    eyebrow: {
        fontSize: 10,
        color: COLORS.textMuted,
        letterSpacing: 4,
        fontWeight: TYPOGRAPHY.weightBold,
        marginBottom: SPACING.md,
    },
    card: {
        width: Math.min(width * 0.8, height * 0.35),
        height: height * 0.4,
        borderRadius: RADIUS['3xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        ...SHADOWS.xl,
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    emoji: {
        fontSize: height * 0.1,
        marginBottom: SPACING.md,
    },
    name: {
        fontSize: 28,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 2,
    },
    trait: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.accentPurple,
        textAlign: 'center',
        letterSpacing: 2,
    },
    description: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
        paddingHorizontal: SPACING.xl,
    },
    buttonContainer: {
        width: '100%',
        gap: SPACING.sm,
    },
    continueButton: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.lg,
    },
    continueGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueText: {
        fontSize: 13,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: 'white',
        letterSpacing: 2,
    },
    shuffleButton: {
        paddingVertical: SPACING.xs,
        alignItems: 'center',
    },
    shuffleText: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: TYPOGRAPHY.weightBold,
        opacity: 0.8,
    },
});
