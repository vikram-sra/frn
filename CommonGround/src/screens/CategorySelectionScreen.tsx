import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSession } from '../context/SessionContext';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    RADIUS,
    CATEGORY_COLORS,
    SHADOWS,
    GLASS_CARD,
    hexToRgba,
} from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TRENDING_TOPICS = [
    "Modern Life",
    "Artificial Intelligence",
    "Social Media",
    "Work Culture",
    "Climate Action",
    "Digital Privacy",
    "Education Reform",
    "Future of Cities"
];

// ═══════════════════════════════════════════════════════════════
// 🌟 ANIMATED PARTICLE BACKGROUND
// ═══════════════════════════════════════════════════════════════
function ParticleBackground() {
    const particles = useRef(
        Array.from({ length: 30 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 2 + Math.random() * 3,
            opacity: new Animated.Value(0.1 + Math.random() * 0.3),
            duration: 2000 + Math.random() * 3000,
        }))
    ).current;

    useEffect(() => {
        particles.forEach((particle) => {
            const animate = () => {
                Animated.sequence([
                    Animated.timing(particle.opacity, {
                        toValue: 0.5 + Math.random() * 0.3,
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

// ═══════════════════════════════════════════════════════════════
// 🎴 TOPIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface TopicCardProps {
    topic: string;
    index: number;
    onSelect: (topic: string) => void;
}

function TopicCard({ topic, index, onSelect }: TopicCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const categoryColor = CATEGORY_COLORS[topic] || CATEGORY_COLORS["Modern Life"];

    useEffect(() => {
        Animated.parallel([
            Animated.spring(fadeAnim, {
                toValue: 1,
                delay: index * 60,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                delay: index * 60,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index]);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.96,
                tension: 200,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 200,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }),
        ]).start();
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                onPress={() => onSelect(topic)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View
                    style={[
                        styles.card,
                        {
                            shadowColor: categoryColor.primary,
                            shadowOpacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.4],
                            }),
                            shadowRadius: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 20],
                            }),
                        },
                    ]}
                >
                    {/* Gradient accent bar */}
                    <LinearGradient
                        colors={categoryColor.gradient as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.accentBar}
                    />

                    {/* Glass highlight overlay */}
                    <View style={styles.glassHighlight} />

                    {/* Content */}
                    <View style={styles.cardContent}>
                        <View style={styles.indexContainer}>
                            <Text style={[styles.index, { color: categoryColor.primary }]}>
                                {(index + 1).toString().padStart(2, '0')}
                            </Text>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.topic}>{topic}</Text>
                            <View style={styles.trendIndicator}>
                                <View style={[styles.trendDot, { backgroundColor: categoryColor.primary }]} />
                                <View style={[styles.trendDot, styles.trendDotPulse, { backgroundColor: categoryColor.accent }]} />
                                <Text style={styles.trendText}>TRENDING NOW</Text>
                            </View>
                        </View>

                        {/* Arrow with gradient background */}
                        <View style={styles.arrowWrapper}>
                            <LinearGradient
                                colors={[hexToRgba(categoryColor.primary, 0.2), hexToRgba(categoryColor.primary, 0.05)]}
                                style={styles.arrowContainer}
                            >
                                <Text style={[styles.arrow, { color: categoryColor.primary }]}>→</Text>
                            </LinearGradient>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🏠 MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function CategorySelectionScreen() {
    const { dispatch } = useSession();
    const titleAnim = useRef(new Animated.Value(0)).current;
    const subtitleAnim = useRef(new Animated.Value(0)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Staggered entrance animation
        Animated.stagger(100, [
            Animated.spring(logoAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(titleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(subtitleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous pulse for live indicator
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleSelect = (category: string) => {
        dispatch({ type: 'SET_CATEGORY', category });
    };

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={['#030712', '#0F172A', '#1E1B4B', '#0F172A', '#030712']}
                locations={[0, 0.3, 0.5, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Animated particles */}
            <ParticleBackground />

            {/* Gradient orbs */}
            <View style={styles.orbContainer}>
                <View style={[styles.orb, styles.orbPurple]} />
                <View style={[styles.orb, styles.orbCyan]} />
                <View style={[styles.orb, styles.orbPink]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoAnim,
                            transform: [
                                {
                                    scale: logoAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#A855F7', '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoGradient}
                    >
                        <Text style={styles.logoText}>CG</Text>
                    </LinearGradient>
                </Animated.View>

                <Animated.Text
                    style={[
                        styles.title,
                        {
                            opacity: titleAnim,
                            transform: [
                                {
                                    translateY: titleAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-30, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    Find Common{'\n'}Ground
                </Animated.Text>

                <Animated.View
                    style={[
                        styles.subtitleContainer,
                        {
                            opacity: subtitleAnim,
                            transform: [
                                {
                                    translateY: subtitleAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.liveIndicator}>
                        <Animated.View
                            style={[
                                styles.liveDotOuter,
                                { transform: [{ scale: pulseAnim }] },
                            ]}
                        />
                        <View style={styles.liveDot} />
                    </View>
                    <Text style={styles.subtitle}>CHOOSE A TOPIC TO EXPLORE</Text>
                </Animated.View>
            </View>

            {/* Topics List */}
            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            >
                {TRENDING_TOPICS.map((topic, index) => (
                    <TopicCard
                        key={topic}
                        topic={topic}
                        index={index}
                        onSelect={handleSelect}
                    />
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
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
    orbContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.15,
    },
    orbPurple: {
        width: 400,
        height: 400,
        backgroundColor: '#A855F7',
        top: -100,
        right: -150,
        transform: [{ scale: 1.5 }],
    },
    orbCyan: {
        width: 300,
        height: 300,
        backgroundColor: '#06B6D4',
        bottom: 200,
        left: -100,
    },
    orbPink: {
        width: 250,
        height: 250,
        backgroundColor: '#EC4899',
        bottom: -50,
        right: -50,
    },
    particle: {
        position: 'absolute',
        backgroundColor: COLORS.starWhite,
        borderRadius: 50,
    },
    header: {
        paddingHorizontal: SPACING['2xl'],
        paddingTop: 70,
        marginBottom: SPACING['2xl'],
    },
    logoContainer: {
        marginBottom: SPACING.lg,
    },
    logoGradient: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: TYPOGRAPHY.size2xl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingTight,
    },
    title: {
        fontSize: TYPOGRAPHY.size5xl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingTighter,
        lineHeight: TYPOGRAPHY.size5xl * TYPOGRAPHY.lineHeightTight,
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        gap: SPACING.sm,
    },
    liveIndicator: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    liveDotOuter: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.successGlow,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textMuted,
        letterSpacing: TYPOGRAPHY.trackingWidest,
    },
    list: {
        paddingHorizontal: SPACING['2xl'],
    },
    card: {
        backgroundColor: COLORS.glassBg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: RADIUS['2xl'],
        marginBottom: SPACING.md,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 0 },
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    glassHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: COLORS.glassHighlight,
        opacity: 0.3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.xl,
        paddingLeft: SPACING['2xl'],
    },
    indexContainer: {
        marginRight: SPACING.xl,
    },
    index: {
        fontSize: TYPOGRAPHY.size2xl,
        fontWeight: TYPOGRAPHY.weightBlack,
        fontVariant: ['tabular-nums'],
        opacity: 0.7,
    },
    textContainer: {
        flex: 1,
    },
    topic: {
        fontSize: TYPOGRAPHY.sizeXl,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    trendIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    trendDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    trendDotPulse: {
        marginLeft: -4,
        opacity: 0.5,
    },
    trendText: {
        fontSize: TYPOGRAPHY.sizeXs,
        fontWeight: TYPOGRAPHY.weightSemibold,
        color: COLORS.textMuted,
        letterSpacing: TYPOGRAPHY.trackingWider,
        marginLeft: SPACING.xs,
    },
    arrowWrapper: {
        marginLeft: SPACING.md,
    },
    arrowContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        fontSize: TYPOGRAPHY.sizeLg,
        fontWeight: TYPOGRAPHY.weightBold,
    },
});
