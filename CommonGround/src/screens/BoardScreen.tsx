import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSession } from '../context/SessionContext';
import { getSessions, SavedSession } from '../utils/storage';
import mockData from '../constants/mockGlobalBoard.json';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    RADIUS,
    GLASS_CARD,
    getCategoryColor,
    SHADOWS,
    hexToRgba,
} from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface BoardScreenProps {
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// 🌟 FLOATING PARTICLE COMPONENT
// ═══════════════════════════════════════════════════════════════
function FloatingParticles() {
    const particles = useRef(
        Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 3,
            opacity: new Animated.Value(0.1 + Math.random() * 0.3),
            translateY: new Animated.Value(0),
            duration: 3000 + Math.random() * 4000,
        }))
    ).current;

    useEffect(() => {
        particles.forEach((particle, i) => {
            const animateParticle = () => {
                Animated.parallel([
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
                    ]),
                    Animated.sequence([
                        Animated.timing(particle.translateY, {
                            toValue: -20 - Math.random() * 30,
                            duration: particle.duration * 2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.translateY, {
                            toValue: 0,
                            duration: particle.duration * 2,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start(() => animateParticle());
            };
            setTimeout(() => animateParticle(), i * 100);
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
                            transform: [{ translateY: particle.translateY }],
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════
// 📜 SESSION HISTORY CARD
// ═══════════════════════════════════════════════════════════════
interface SessionCardProps {
    session: SavedSession;
    index: number;
}

function SessionCard({ session, index }: SessionCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const categoryColor = getCategoryColor(session.category);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(fadeAnim, {
                toValue: 1,
                delay: index * 80,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                delay: index * 80,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, tension: 200, friction: 10, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start();
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStandColor = (stand: string) => {
        switch (stand) {
            case 'agreement': return COLORS.success;
            case 'opposition': return COLORS.error;
            default: return COLORS.info;
        }
    };

    const getStandEmoji = (stand: string) => {
        switch (stand) {
            case 'agreement': return '🤝';
            case 'opposition': return '⚔️';
            default: return '⚖️';
        }
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
                style={styles.historyCard}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {/* Accent border */}
                <LinearGradient
                    colors={categoryColor.gradient as [string, string, ...string[]]}
                    style={styles.cardAccent}
                />

                <View style={styles.historyHeader}>
                    <View style={styles.historyLeft}>
                        <View style={[styles.categoryDot, { backgroundColor: categoryColor.primary }]} />
                        <Text style={styles.historyCategory}>{session.category}</Text>
                    </View>
                    <Text style={styles.historyDate}>{formatDate(session.date)}</Text>
                </View>

                <View style={styles.historyStats}>
                    <View style={[
                        styles.standBadge,
                        { backgroundColor: hexToRgba(getStandColor(session.userStand), 0.15) }
                    ]}>
                        <Text style={styles.standEmoji}>{getStandEmoji(session.userStand)}</Text>
                        <Text style={[styles.standText, { color: getStandColor(session.userStand) }]}>
                            {session.userStand.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.historyNumbers}>
                        <Text style={[styles.historyNumber, { color: COLORS.success }]}>
                            {session.commonalities.length} common
                        </Text>
                        <Text style={styles.historyDot}>•</Text>
                        <Text style={[styles.historyNumber, { color: COLORS.error }]}>
                            {session.differences.length} different
                        </Text>
                    </View>
                </View>

                {session.commonalities.length > 0 && (
                    <View style={styles.historyPreview}>
                        <Text style={styles.historyPreviewText} numberOfLines={2}>
                            "{session.commonalities[0]}"
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🌍 GLOBAL CONSENSUS TAG
// ═══════════════════════════════════════════════════════════════
interface ConsensusTagProps {
    item: string;
    index: number;
    isSession?: boolean;
}

function ConsensusTag({ item, index, isSession }: ConsensusTagProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(fadeAnim, {
                toValue: 1,
                delay: index * 40,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay: index * 40,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index]);

    const variance = 0.9 + Math.random() * 0.2;
    const baseColor = isSession ? COLORS.success : COLORS.info;

    return (
        <Animated.View
            style={[
                isSession ? styles.sessionTag : styles.tag,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: Animated.multiply(scaleAnim, variance) }],
                },
            ]}
        >
            <Text style={[isSession ? styles.sessionTagText : styles.tagText, { color: baseColor }]}>
                {item}
            </Text>
        </Animated.View>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🏠 MAIN BOARD SCREEN
// ═══════════════════════════════════════════════════════════════
export default function BoardScreen({ onClose }: BoardScreenProps) {
    const { state, dispatch } = useSession();
    const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSessions();

        Animated.stagger(100, [
            Animated.parallel([
                Animated.spring(fadeAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
            ]),
            Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const loadSessions = async () => {
        const sessions = await getSessions();
        setSavedSessions(sessions);
    };

    const sessionItems = state.commonalities.map((c) => c.text);
    const globalItems = mockData.commonalities;

    const handleStartNew = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        dispatch({ type: 'RESET_SESSION' });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }
            ]}
        >
            {/* Background */}
            <LinearGradient
                colors={['#030712', '#0F172A', '#1E1B4B', '#0F172A', '#030712']}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Floating particles */}
            <FloatingParticles />

            {/* Gradient orbs */}
            <View style={styles.orbContainer}>
                <View style={[styles.orb, styles.orbBlue]} />
                <View style={[styles.orb, styles.orbPurple]} />
            </View>

            {/* Header */}
            <Animated.View style={[styles.header, { opacity: headerAnim }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Humanity's Ledger</Text>
                        <Text style={styles.subtitle}>What we all agree on</Text>
                    </View>
                    <TouchableOpacity onPress={handleStartNew} style={styles.newButton}>
                        <LinearGradient
                            colors={[COLORS.accentPurple, COLORS.cosmicPurple]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.newButtonGradient}
                        >
                            <Text style={styles.newButtonText}>+ NEW</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Current Session */}
                {sessionItems.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconContainer}>
                                <LinearGradient
                                    colors={[COLORS.success, COLORS.successDark]}
                                    style={styles.sectionIcon}
                                >
                                    <Text style={styles.sectionIconText}>✨</Text>
                                </LinearGradient>
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>This Session</Text>
                                <Text style={styles.sectionSubtitle}>Common ground you found</Text>
                            </View>
                        </View>
                        <View style={styles.cloudContainer}>
                            {sessionItems.slice(0, 10).map((item, index) => (
                                <ConsensusTag key={`session-${index}`} item={item} index={index} isSession />
                            ))}
                        </View>
                    </View>
                )}

                {/* Previous Sessions */}
                {savedSessions.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconContainer}>
                                <LinearGradient
                                    colors={[COLORS.accentPurple, COLORS.cosmicPurple]}
                                    style={styles.sectionIcon}
                                >
                                    <Text style={styles.sectionIconText}>📚</Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.sectionTitleRow}>
                                <View>
                                    <Text style={styles.sectionTitle}>Your History</Text>
                                    <Text style={styles.sectionSubtitle}>Past conversations</Text>
                                </View>
                                <View style={styles.countPill}>
                                    <Text style={styles.countPillText}>{savedSessions.length}</Text>
                                </View>
                            </View>
                        </View>

                        {savedSessions.slice(0, 5).map((session, index) => (
                            <SessionCard key={session.id} session={session} index={index} />
                        ))}
                    </View>
                )}

                {/* Global Consensus */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconContainer}>
                            <LinearGradient
                                colors={[COLORS.info, COLORS.infoDark]}
                                style={styles.sectionIcon}
                            >
                                <Text style={styles.sectionIconText}>🌍</Text>
                            </LinearGradient>
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Global Consensus</Text>
                            <Text style={styles.sectionSubtitle}>What humanity agrees on</Text>
                        </View>
                    </View>

                    <Text style={styles.globalDescription}>
                        Aggregated from thousands of conversations worldwide
                    </Text>

                    <View style={styles.cloudContainer}>
                        {globalItems.slice(0, 20).map((item, index) => (
                            <ConsensusTag key={`global-${index}`} item={item} index={index} />
                        ))}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </Animated.View>
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
        opacity: 0.12,
    },
    orbBlue: {
        width: 350,
        height: 350,
        backgroundColor: COLORS.info,
        top: 100,
        right: -100,
    },
    orbPurple: {
        width: 300,
        height: 300,
        backgroundColor: COLORS.accentPurple,
        bottom: 200,
        left: -100,
    },
    particle: {
        position: 'absolute',
        backgroundColor: COLORS.starWhite,
        borderRadius: 50,
    },
    header: {
        paddingHorizontal: SPACING['2xl'],
        paddingTop: 60,
        paddingBottom: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: TYPOGRAPHY.size3xl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingTight,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizeMd,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
    },
    newButton: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    newButtonGradient: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    newButtonText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: SPACING.xl,
    },
    section: {
        paddingHorizontal: SPACING['2xl'],
        paddingTop: SPACING['2xl'],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.lg,
    },
    sectionIconContainer: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    sectionIcon: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionIconText: {
        fontSize: 22,
    },
    sectionTitleRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizeXl,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
    },
    sectionSubtitle: {
        fontSize: TYPOGRAPHY.sizeSm,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    countPill: {
        backgroundColor: COLORS.glassBg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    countPillText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textSecondary,
    },
    globalDescription: {
        fontSize: TYPOGRAPHY.sizeSm,
        color: COLORS.textMuted,
        marginBottom: SPACING.lg,
        lineHeight: TYPOGRAPHY.sizeSm * 1.5,
    },
    cloudContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    tag: {
        backgroundColor: hexToRgba(COLORS.info, 0.12),
        borderWidth: 1,
        borderColor: hexToRgba(COLORS.info, 0.25),
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    tagText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightMedium,
    },
    sessionTag: {
        backgroundColor: hexToRgba(COLORS.success, 0.12),
        borderWidth: 1,
        borderColor: hexToRgba(COLORS.success, 0.25),
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    sessionTagText: {
        fontSize: TYPOGRAPHY.sizeSm,
        fontWeight: TYPOGRAPHY.weightMedium,
    },
    historyCard: {
        ...GLASS_CARD,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    cardAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        marginLeft: SPACING.md,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    historyCategory: {
        fontSize: TYPOGRAPHY.sizeMd,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
    },
    historyDate: {
        fontSize: TYPOGRAPHY.sizeXs,
        color: COLORS.textMuted,
    },
    historyStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
        marginLeft: SPACING.md,
    },
    standBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    standEmoji: {
        fontSize: 12,
    },
    standText: {
        fontSize: TYPOGRAPHY.sizeXs,
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: TYPOGRAPHY.trackingWide,
    },
    historyNumbers: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    historyNumber: {
        fontSize: TYPOGRAPHY.sizeXs,
        fontWeight: TYPOGRAPHY.weightMedium,
    },
    historyDot: {
        color: COLORS.textMuted,
    },
    historyPreview: {
        backgroundColor: COLORS.bgPrimary,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginLeft: SPACING.md,
    },
    historyPreviewText: {
        fontSize: TYPOGRAPHY.sizeSm,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        lineHeight: TYPOGRAPHY.sizeSm * 1.5,
    },
});
