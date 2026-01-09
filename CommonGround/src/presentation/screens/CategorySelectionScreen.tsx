import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSession } from '../context/SessionContext';
import { botController, BOT_PERSONAS } from '../../data/services/BotService';
import { trendsService, TrendingTopic } from '../../data/services/TrendsService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GLASS_CARD, SHADOWS, CATEGORY_COLORS, hexToRgba } from '../theme';

const { width, height } = Dimensions.get('window');

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
// 🔘 CUSTOM DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════════
interface DropdownProps {
    label: string;
    options: string[];
    value: string;
    onSelect: (val: string) => void;
    icon?: string;
}

function GlassDropdown({ label, options, value, onSelect, icon }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        const toValue = isOpen ? 0 : 1;
        setIsOpen(!isOpen);
        Animated.spring(anim, {
            toValue,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    };

    return (
        <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>{label}</Text>
            <TouchableOpacity
                onPress={toggle}
                activeOpacity={0.9}
                style={[styles.dropdownHeader, isOpen && styles.dropdownHeaderOpen]}
            >
                <View style={styles.dropdownHeaderContent}>
                    {icon && <Text style={styles.dropdownIcon}>{icon}</Text>}
                    <Text style={styles.dropdownValue}>{value.toUpperCase()}</Text>
                </View>
                <Text style={[styles.chevron, { transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }]}>▼</Text>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdownMenu}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                                onPress={() => {
                                    onSelect(opt);
                                    toggle();
                                }}
                            >
                                <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>
                                    {opt}
                                </Text>
                                {value === opt && <Text style={styles.checkIcon}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════
// 🎴 TOPIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface TopicCardProps {
    topic: TrendingTopic;
    index: number;
    onSelect: (topic: TrendingTopic) => void;
}

function TopicCard({ topic, index, onSelect }: TopicCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const categoryColor = CATEGORY_COLORS[topic.category] || CATEGORY_COLORS["Modern Life"];

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
                    <LinearGradient
                        colors={categoryColor.gradient as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.accentBar}
                    />

                    <View style={styles.glassHighlight} />

                    <View style={styles.cardContent}>
                        <View style={styles.indexContainer}>
                            <Text style={[styles.index, { color: categoryColor.primary }]}>
                                {topic.traffic.includes('K') ? topic.traffic.replace('+', '') : index + 1}
                            </Text>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.topicHeader}>{topic.title}</Text>
                            <Text style={styles.debateQuestion}>{topic.debateQuestion}</Text>
                            <View style={styles.trendIndicator}>
                                <View style={[styles.trendDot, { backgroundColor: categoryColor.primary }]} />
                                <Text style={styles.trendText}>{topic.category.toUpperCase()}</Text>
                            </View>
                        </View>

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
    const { state, dispatch } = useSession();
    const [topics, setTopics] = useState<TrendingTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [opponentMode, setOpponentMode] = useState('Human Match');

    const titleAnim = useRef(new Animated.Value(0)).current;
    const subtitleAnim = useRef(new Animated.Value(0)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadTopics();

        Animated.stagger(100, [
            Animated.spring(logoAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.spring(titleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.spring(subtitleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const loadTopics = async () => {
        setIsLoading(true);
        const liveTopics = await trendsService.fetchTrendingTopics();
        setTopics(liveTopics);
        setIsLoading(false);
    };

    const handleSelectTopic = (topic: TrendingTopic) => {
        // Set context category/topic
        dispatch({ type: 'SET_CATEGORY', category: topic.title });

        if (opponentMode === 'Human Match') {
            // Path A: Human Match -> Shuffler/Matching
            dispatch({ type: 'START_MATCH' });
        } else {
            // Path B: Bot Match -> Jump directly to CG Board
            const selectedBot = BOT_PERSONAS.find(b => b.name === opponentMode);
            if (selectedBot) {
                botController.setBot(selectedBot.id as any);
                dispatch({
                    type: 'START_SESSION',
                    botName: selectedBot.name,
                    matchColor: CATEGORY_COLORS[topic.category]?.primary || '#A855F7'
                });
            }
        }
    };

    const filteredTopics = selectedCategory === 'All'
        ? topics
        : topics.filter(t => t.category === selectedCategory);

    const opponentOptions = ['Human Match', ...BOT_PERSONAS.map(b => b.name)];
    const categoryOptions = trendsService.getAllCategories();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#030712', '#0F172A', '#1E1B4B', '#0F172A', '#030712']}
                locations={[0, 0.3, 0.5, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            <ParticleBackground />

            <View style={styles.orbContainer}>
                <View style={[styles.orb, styles.orbPurple]} />
                <View style={[styles.orb, styles.orbCyan]} />
                <View style={[styles.orb, styles.orbPink]} />
            </View>

            <ScrollView
                style={styles.mainScroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Step Indicator & Back Button */}
                <View style={styles.topNav}>
                    <TouchableOpacity
                        onPress={() => dispatch({ type: 'RESET_SESSION' })}
                        style={styles.backButton}
                    >
                        <Text style={styles.backArrow}>←</Text>
                        <Text style={styles.backText}>BACK</Text>
                    </TouchableOpacity>

                    <View style={styles.stepIndicator}>
                        <View style={styles.stepDot} />
                        <View style={styles.stepLine} />
                        <View style={[styles.stepDot, styles.stepActive]} />
                    </View>

                    <View style={{ width: 80 }} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Animated.View style={[styles.logoContainer, { opacity: logoAnim, transform: [{ scale: logoAnim }] }]}>
                        <LinearGradient colors={['#A855F7', '#06B6D4']} style={styles.logoGradient}>
                            <Text style={styles.logoText}>CG</Text>
                        </LinearGradient>
                    </Animated.View>

                    <Animated.Text style={[styles.title, { opacity: titleAnim }]}>
                        Find Common{'\n'}Ground
                    </Animated.Text>

                    <Animated.View style={[styles.subtitleContainer, { opacity: subtitleAnim }]}>
                        <View style={styles.liveIndicator}>
                            <Animated.View style={[styles.liveDotOuter, { transform: [{ scale: pulseAnim }] }]} />
                            <View style={styles.liveDot} />
                        </View>
                        <Text style={styles.subtitle}>WORLD TRENDS ARE LIVE</Text>
                    </Animated.View>
                </View>

                {/* Selectors Section */}
                <View style={styles.selectorsSection}>
                    <GlassDropdown
                        label="CHOOSE OPPONENT"
                        icon="👤"
                        options={opponentOptions}
                        value={opponentMode}
                        onSelect={setOpponentMode}
                    />
                    <GlassDropdown
                        label="FILTER CATEGORY"
                        icon="📂"
                        options={categoryOptions}
                        value={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </View>

                {/* Topics Section */}
                <View style={styles.topicsSection}>
                    <Text style={styles.sectionHeader}>SELECT A TRENDING TOPIC</Text>
                    {isLoading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={COLORS.accentPurple} />
                            <Text style={styles.loadingText}>Fetching live trends...</Text>
                        </View>
                    ) : (
                        filteredTopics.map((topic, index) => (
                            <TopicCard
                                key={topic.id}
                                topic={topic}
                                index={index}
                                onSelect={handleSelectTopic}
                            />
                        ))
                    )}
                </View>
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
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
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
        paddingTop: 20,
        marginBottom: SPACING.xl,
    },
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['2xl'],
        marginTop: 60,
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: 80,
    },
    backArrow: {
        color: COLORS.textPrimary,
        fontSize: 14,
    },
    backText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: 1,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
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
    logoContainer: {
        marginBottom: SPACING.lg,
    },
    logoGradient: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: TYPOGRAPHY.sizeXl,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
    },
    title: {
        fontSize: 42,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        letterSpacing: -1.5,
        lineHeight: 44,
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
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
        fontSize: 11,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textMuted,
        letterSpacing: 2,
    },
    selectorsSection: {
        paddingHorizontal: SPACING['2xl'],
        gap: SPACING.md,
        marginBottom: SPACING['2xl'],
    },
    dropdownWrapper: {
        zIndex: 10,
    },
    dropdownLabel: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textMuted,
        letterSpacing: 1.5,
        marginBottom: 6,
        marginLeft: 4,
    },
    dropdownHeader: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownHeaderOpen: {
        borderColor: COLORS.accentPurple,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
    dropdownHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dropdownIcon: {
        fontSize: 16,
    },
    dropdownValue: {
        fontSize: 13,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        letterSpacing: 0.5,
    },
    chevron: {
        color: COLORS.textMuted,
        fontSize: 10,
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        zIndex: 100,
        ...SHADOWS.xl,
    },
    dropdownItem: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    dropdownItemActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
    },
    dropdownItemText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: TYPOGRAPHY.weightMedium,
    },
    dropdownItemTextActive: {
        color: COLORS.textPrimary,
        fontWeight: TYPOGRAPHY.weightBold,
    },
    checkIcon: {
        color: COLORS.accentPurple,
        fontSize: 12,
        fontWeight: 'bold',
    },
    topicsSection: {
        paddingHorizontal: SPACING['2xl'],
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textSecondary,
        letterSpacing: 2,
        marginBottom: SPACING.lg,
        marginLeft: 4,
    },
    loaderContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 20,
    },
    loadingText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: TYPOGRAPHY.weightMedium,
    },
    card: {
        backgroundColor: COLORS.glassBg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
        overflow: 'hidden',
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
        height: '40%',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: SPACING.lg,
        paddingLeft: SPACING.xl,
    },
    indexContainer: {
        width: 50,
        marginRight: SPACING.md,
    },
    index: {
        fontSize: 11,
        fontWeight: TYPOGRAPHY.weightBlack,
        opacity: 0.6,
    },
    textContainer: {
        flex: 1,
    },
    topicHeader: {
        fontSize: 16,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    debateQuestion: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 8,
    },
    trendIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trendDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    trendText: {
        fontSize: 9,
        fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textMuted,
        letterSpacing: 1.5,
    },
    arrowWrapper: {
        marginLeft: SPACING.sm,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
