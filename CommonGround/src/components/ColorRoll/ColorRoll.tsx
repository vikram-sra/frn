import React, { useState, useEffect, useRef, memo } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    Text,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, getCategoryColor, SHADOWS, hexToRgba } from '../../constants/theme';

const { height, width } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// 🎨 VIBRANT MATCH COLORS
// ═══════════════════════════════════════════════════════════════
const MATCH_COLORS = [
    { primary: '#10B981', gradient: ['#10B981', '#059669', '#047857'], name: 'Emerald' },
    { primary: '#3B82F6', gradient: ['#3B82F6', '#2563EB', '#1D4ED8'], name: 'Azure' },
    { primary: '#A855F7', gradient: ['#A855F7', '#7C3AED', '#6D28D9'], name: 'Violet' },
    { primary: '#F59E0B', gradient: ['#F59E0B', '#D97706', '#B45309'], name: 'Amber' },
    { primary: '#EC4899', gradient: ['#EC4899', '#DB2777', '#BE185D'], name: 'Rose' },
    { primary: '#06B6D4', gradient: ['#06B6D4', '#0891B2', '#0E7490'], name: 'Cyan' },
];

interface ColorRollProps {
    onMatch: (color: string) => void;
    categoryName: string;
}

// ═══════════════════════════════════════════════════════════════
// 🌟 COSMIC PARTICLE RING
// ═══════════════════════════════════════════════════════════════
const CosmicRing = memo(({ isSearching, matchColor }: { isSearching: boolean; matchColor: string | null }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const particles = useRef(
        Array.from({ length: 16 }, (_, i) => ({
            angle: (i * 22.5) * (Math.PI / 180),
            opacity: new Animated.Value(0.3 + Math.random() * 0.4),
            scale: new Animated.Value(1),
        }))
    ).current;

    useEffect(() => {
        if (isSearching) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 6000,
                    useNativeDriver: true,
                })
            ).start();

            particles.forEach((p, i) => {
                const animate = () => {
                    Animated.parallel([
                        Animated.sequence([
                            Animated.timing(p.opacity, { toValue: 0.9, duration: 600 + Math.random() * 400, useNativeDriver: true }),
                            Animated.timing(p.opacity, { toValue: 0.3, duration: 600 + Math.random() * 400, useNativeDriver: true }),
                        ]),
                        Animated.sequence([
                            Animated.timing(p.scale, { toValue: 1.5, duration: 600, useNativeDriver: true }),
                            Animated.timing(p.scale, { toValue: 1, duration: 600, useNativeDriver: true }),
                        ]),
                    ]).start(() => isSearching && animate());
                };
                setTimeout(() => animate(), i * 50);
            });
        } else if (matchColor) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [isSearching, matchColor]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const ringRadius = 110;

    return (
        <Animated.View style={[styles.cosmicRing, { transform: [{ rotate: rotation }, { scale: scaleAnim }] }]}>
            {particles.map((p, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.cosmicParticle,
                        {
                            left: ringRadius + Math.cos(p.angle) * ringRadius - 5,
                            top: ringRadius + Math.sin(p.angle) * ringRadius - 5,
                            opacity: p.opacity,
                            backgroundColor: matchColor || '#A855F7',
                            transform: [{ scale: p.scale }],
                            shadowColor: matchColor || '#A855F7',
                            shadowOpacity: 0.8,
                            shadowRadius: 10,
                        },
                    ]}
                />
            ))}
        </Animated.View>
    );
});

// ═══════════════════════════════════════════════════════════════
// ✨ FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════════
const FloatingParticles = memo(() => {
    const particles = useRef(
        Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 3,
            opacity: new Animated.Value(0.1 + Math.random() * 0.2),
            translateY: new Animated.Value(0),
            duration: 2000 + Math.random() * 3000,
        }))
    ).current;

    useEffect(() => {
        particles.forEach((particle, i) => {
            const animateParticle = () => {
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(particle.opacity, { toValue: 0.5, duration: particle.duration, useNativeDriver: true }),
                        Animated.timing(particle.opacity, { toValue: 0.1, duration: particle.duration, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(particle.translateY, { toValue: -30, duration: particle.duration * 2, useNativeDriver: true }),
                        Animated.timing(particle.translateY, { toValue: 0, duration: particle.duration * 2, useNativeDriver: true }),
                    ]),
                ]).start(() => animateParticle());
            };
            setTimeout(() => animateParticle(), i * 80);
        });
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((particle, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        borderRadius: particle.size / 2,
                        backgroundColor: '#fff',
                        opacity: particle.opacity,
                        transform: [{ translateY: particle.translateY }],
                    }}
                />
            ))}
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════
// 🔮 MAIN COLOR ROLL COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ColorRoll({ onMatch, categoryName }: ColorRollProps) {
    const [isSearching, setIsSearching] = useState(true);
    const [matchData, setMatchData] = useState<typeof MATCH_COLORS[0] | null>(null);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const connectAnim = useRef(new Animated.Value(0)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const youSlideAnim = useRef(new Animated.Value(-100)).current;
    const themSlideAnim = useRef(new Animated.Value(100)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const categoryColor = getCategoryColor(categoryName);

    // Entrance animation
    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(youSlideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
            Animated.spring(themSlideAnim, { toValue: 0, tension: 60, friction: 10, delay: 100, useNativeDriver: true }),
        ]).start();
    }, []);

    // Wave animation
    useEffect(() => {
        if (!isSearching) return;

        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
                Animated.timing(waveAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
            ])
        ).start();

        // Match after 3.5 seconds
        const matchTimeout = setTimeout(() => {
            setIsSearching(false);
            const selectedMatch = MATCH_COLORS[Math.floor(Math.random() * MATCH_COLORS.length)];
            setMatchData(selectedMatch);

            // Haptic feedback sequence
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
            }

            // Victory shake
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();

            // Match animations
            Animated.parallel([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 300, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
                Animated.spring(connectAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: false }),
            ]).start(() => {
                Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            });

            setTimeout(() => onMatch(selectedMatch.primary), 2000);
        }, 3500);

        return () => clearTimeout(matchTimeout);
    }, [isSearching, onMatch]);

    const waveWidth = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['50%', '100%'],
    });

    const waveOpacity = waveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.8, 0.3],
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] }]}>
            {/* Background gradient */}
            <LinearGradient
                colors={['#030712', '#0F172A', '#1E1B4B', '#0F172A', '#030712']}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Floating particles */}
            <FloatingParticles />

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColor.primary }]} />
                <Text style={styles.categoryText}>{categoryName.toUpperCase()}</Text>
            </View>

            {/* Top Half - You */}
            <Animated.View style={[styles.halfScreen, { transform: [{ translateY: youSlideAnim }, { scale: pulseAnim }] }]}>
                <LinearGradient
                    colors={matchData ? (matchData.gradient as [string, string, ...string[]]) : ['#A855F7', '#7C3AED', '#6D28D9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Subtle pattern overlay */}
                <View style={styles.patternOverlay}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <View key={i} style={[styles.patternLine, { top: `${15 + i * 14}%` }]} />
                    ))}
                </View>

                <View style={styles.labelContainer}>
                    <Text style={styles.label}>YOU</Text>
                    {isSearching ? (
                        <View style={styles.statusContainer}>
                            <SearchingDots />
                            <Text style={styles.statusText}>SEARCHING</Text>
                        </View>
                    ) : (
                        <Animated.View style={[styles.connectedBadge, { opacity: glowAnim, transform: [{ scale: glowAnim }] }]}>
                            <Text style={styles.connectedText}>✓ SYNCHRONIZED</Text>
                        </Animated.View>
                    )}
                </View>
            </Animated.View>

            {/* Center Divider with Cosmic Ring */}
            <View style={styles.dividerContainer}>
                <CosmicRing isSearching={isSearching} matchColor={matchData?.primary || null} />

                {/* Center connection orb */}
                <Animated.View
                    style={[
                        styles.connectionOrb,
                        {
                            backgroundColor: matchData?.primary || categoryColor.primary,
                            transform: [{ scale: connectAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
                            opacity: isSearching ? 0.5 : 1,
                            shadowColor: matchData?.primary || categoryColor.primary,
                            shadowOpacity: 0.9,
                            shadowRadius: 30,
                        },
                    ]}
                >
                    {matchData ? (
                        <Text style={styles.matchIcon}>⚡</Text>
                    ) : (
                        <Animated.View style={[styles.searchingOrb, {
                            opacity: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] })
                        }]} />
                    )}
                </Animated.View>

                {/* Wave line */}
                {isSearching && (
                    <Animated.View style={[styles.waveLine, { width: waveWidth, opacity: waveOpacity }]}>
                        <LinearGradient
                            colors={['transparent', categoryColor.primary, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                )}
            </View>

            {/* Bottom Half - Them */}
            <Animated.View style={[styles.halfScreen, { transform: [{ translateY: themSlideAnim }, { scale: pulseAnim }] }]}>
                <LinearGradient
                    colors={matchData ? (matchData.gradient as [string, string, ...string[]]) : ['#06B6D4', '#0891B2', '#0E7490']}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Blur effect for stranger */}
                {isSearching && <View style={styles.blurOverlay} />}

                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{isSearching ? '???' : 'THEM'}</Text>
                    {isSearching ? (
                        <Text style={styles.statusText}>CONNECTING...</Text>
                    ) : (
                        <Animated.View style={[styles.connectedBadge, { opacity: glowAnim, transform: [{ scale: glowAnim }] }]}>
                            <Text style={styles.connectedText}>✓ MATCHED</Text>
                        </Animated.View>
                    )}
                </View>
            </Animated.View>

            {/* Match notification card */}
            {matchData && (
                <Animated.View
                    style={[
                        styles.matchNotification,
                        {
                            opacity: glowAnim,
                            transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
                        },
                    ]}
                >
                    <View style={styles.matchBadge}>
                        <LinearGradient
                            colors={matchData.gradient as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.matchBadgeInner}
                        >
                            <Text style={styles.matchEmoji}>🤝</Text>
                            <Text style={styles.matchText}>CONNECTION FOUND</Text>
                            <Text style={styles.matchSubtext}>Entering conversation...</Text>
                        </LinearGradient>
                    </View>
                </Animated.View>
            )}
        </Animated.View>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🔍 SEARCHING DOTS COMPONENT
// ═══════════════════════════════════════════════════════════════
function SearchingDots() {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                ])
            ).start();
        };
        animateDot(dot1, 0);
        animateDot(dot2, 150);
        animateDot(dot3, 300);
    }, []);

    return (
        <View style={styles.searchingDots}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
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
    categoryBadge: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightBold,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: TYPOGRAPHY.trackingWidest,
    },
    halfScreen: {
        height: height / 2 - 70,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    patternOverlay: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    patternLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    labelContainer: {
        alignItems: 'center',
        gap: 20,
    },
    label: {
        fontSize: TYPOGRAPHY.size6xl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: TYPOGRAPHY.trackingWider,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchingDots: {
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    statusText: {
        fontSize: TYPOGRAPHY.sizeLg,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: TYPOGRAPHY.trackingWidest,
    },
    connectedBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    connectedText: {
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    dividerContainer: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bgPrimary,
    },
    cosmicRing: {
        position: 'absolute',
        width: 220,
        height: 220,
    },
    cosmicParticle: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        shadowOffset: { width: 0, height: 0 },
    },
    connectionOrb: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 0 },
    },
    searchingOrb: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    matchIcon: {
        fontSize: 32,
    },
    waveLine: {
        position: 'absolute',
        height: 3,
        borderRadius: 2,
        overflow: 'hidden',
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    matchNotification: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 200,
    },
    matchBadge: {
        borderRadius: 28,
        overflow: 'hidden',
        ...SHADOWS.xl,
    },
    matchBadgeInner: {
        paddingHorizontal: 36,
        paddingVertical: 24,
        alignItems: 'center',
    },
    matchEmoji: {
        fontSize: 44,
        marginBottom: 12,
    },
    matchText: {
        fontSize: TYPOGRAPHY.sizeXl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    matchSubtext: {
        fontSize: TYPOGRAPHY.sizeMd,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 6,
        fontWeight: TYPOGRAPHY.weightMedium,
    },
});
