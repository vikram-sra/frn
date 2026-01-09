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
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// 🌟 ANIMATED PARTICLE BACKGROUND
// ═══════════════════════════════════════════════════════════════
function ParticleBackground() {
    const particles = useRef(
        Array.from({ length: 30 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2,
            opacity: new Animated.Value(0.1 + Math.random() * 0.3),
            duration: 3000 + Math.random() * 4000,
        }))
    ).current;

    useEffect(() => {
        particles.forEach((particle) => {
            const animate = () => {
                Animated.sequence([
                    Animated.timing(particle.opacity, {
                        toValue: 0.4 + Math.random() * 0.3,
                        duration: particle.duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.opacity, {
                        toValue: 0.1 + Math.random() * 0.2,
                        duration: particle.duration,
                        useNativeDriver: true,
                    }),
                ]).start(() => animate());
            };
            animate();
        });
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((particle, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.particle,
                        {
                            left: particle.x,
                            top: particle.y,
                            width: particle.size,
                            height: particle.size,
                            opacity: particle.opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

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

        // Entrance Sequence
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.parallel([
                Animated.spring(pulseAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
                Animated.spring(emojiScale, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        ]).start();
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
        <View style={styles.container}><LinearGradient
            colors={['#030712', '#1E1B4B', '#030712']}
            style={StyleSheet.absoluteFill}
        /><ParticleBackground /><View style={styles.stepIndicator}><View style={[styles.stepDot, styles.stepActive]} /><View style={styles.stepLine} /><View style={styles.stepDot} /></View><Animated.View style={[styles.content, { opacity: fadeAnim }]}><Animated.Text style={[styles.eyebrow, { transform: [{ translateY: slideAnim }] }]}>YOUR DIGITAL AVATAR</Animated.Text><Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }]}><LinearGradient
            colors={['rgba(168, 85, 247, 0.2)', 'rgba(6, 182, 212, 0.1)']}
            style={styles.cardGradient}
        /><Animated.Text style={[
            styles.emoji,
            { transform: [{ scale: emojiScale }] }
        ]}>{identity.avatarEmoji}</Animated.Text><Animated.View style={{ transform: [{ translateY: slideAnim }] }}><Text style={styles.name}>{identity.name}</Text><Text style={styles.trait}>{identity.trait.toUpperCase()}</Text></Animated.View></Animated.View><Animated.Text style={[styles.description, { opacity: fadeAnim }]}>This pseudonym protects your identity, allowing you to speak freely without judgment.</Animated.Text><View style={styles.buttonContainer}><TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
        ><LinearGradient
            colors={['#A855F7', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
        ><Text style={styles.continueText}>NEXT: CHOOSE TOPIC</Text></LinearGradient></TouchableOpacity><TouchableOpacity
            style={styles.shuffleButton}
            onPress={handleShuffle}
            activeOpacity={0.7}
        ><Text style={styles.shuffleText}>SHUFFLE PERSONA</Text></TouchableOpacity></View></Animated.View></View>
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
    particle: {
        position: 'absolute',
        backgroundColor: COLORS.accentPurple,
        borderRadius: 10,
    },
});
