import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSession } from '../context/SessionContext';
import { trendsService, TrendingTopic } from '../../data/services/TrendsService';
import { ParticleBackground } from '../components/ParticleBackground';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../theme';
import { Linking, Platform, LayoutAnimation, UIManager } from 'react-native';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * 🏠 SIMPLIFIED TREND SELECTION SCREEN
 * Custom RSS URL entry for direct Google Trends access.
 */
export default function CategorySelectionScreen() {
    const { dispatch } = useSession();

    // Default static URL as requested
    const [rssUrl, setRssUrl] = useState('https://trends.google.com/trending/rss?geo=CA');
    const [topics, setTopics] = useState<TrendingTopic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadTopics();
    }, []);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const handleConfirm = (topic: TrendingTopic) => {
        dispatch({ type: 'SET_CATEGORY', category: topic.title });
    };

    const loadTopics = async () => {
        if (!rssUrl.trim()) return;
        try {
            setIsLoading(true);
            const liveTopics = await trendsService.fetchByUrl(rssUrl);
            setTopics(liveTopics || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#030712', '#0F172A', '#030712']} style={StyleSheet.absoluteFill} />
            <ParticleBackground />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => dispatch({ type: 'RESET_SESSION' })} style={styles.backBtn}>
                        <Text style={styles.backText}>← IDENTITY</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepTitle}>STEP 2: GOOGLE TRENDS FEED</Text>
                    <Text style={styles.mainTitle}>Choose Your Topic</Text>
                </View>

                {/* URL Terminal Section */}
                <View style={styles.urlTerminal}>
                    <Text style={styles.terminalLabel}>INPUT GOOGLE TRENDS RSS URL:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.urlInput}
                            value={rssUrl}
                            onChangeText={setRssUrl}
                            placeholder="https://trends.google.com/..."
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity style={styles.loadBtn} onPress={loadTopics} disabled={isLoading}>
                        <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.loadGradient}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loadBtnText}>FETCH LIVE TRENDS</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Results Matrix */}
                <View style={styles.tableSection}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.columnHeader, { width: 30 }]}>#</Text>
                        <Text style={[styles.columnHeader, { width: 70 }]}>TRAFFIC</Text>
                        <Text style={[styles.columnHeader, { flex: 1 }]}>TRENDING TOPIC</Text>
                    </View>

                    {topics.length === 0 && !isLoading && <Text style={styles.noDataText}>No data retrieved. Check URL or connection.</Text>}

                    {topics.map((topic, index) => {
                        const isExpanded = expandedId === topic.id;
                        const query = encodeURIComponent(topic.title);

                        // Dynamic News links based on topic
                        const news = [
                            { label: 'Positive Outlook', type: 'positive', url: `https://news.google.com/search?q=${query}+success+positive` },
                            { label: 'Critical Analysis', type: 'negative', url: `https://news.google.com/search?q=${query}+controversy+criticism` },
                            { label: 'Neutral Report', type: 'neutral', url: `https://news.google.com/search?q=${query}+facts+overview` },
                        ];

                        return (
                            <View key={topic.id} style={[styles.rowContainer, isExpanded && styles.rowExpanded]}>
                                <TouchableOpacity
                                    style={styles.tableRow}
                                    onPress={() => toggleExpand(topic.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.cell, { width: 30 }]}>
                                        <Text style={styles.rankText}>{index + 1}</Text>
                                    </View>
                                    <View style={[styles.cell, { width: 70 }]}>
                                        <Text style={styles.trafficText}>{topic.traffic}</Text>
                                    </View>
                                    <View style={[styles.cell, { flex: 1 }]}>
                                        <Text style={styles.topicTitle}>{topic.title}</Text>
                                        <Text style={styles.topicSubtitle} numberOfLines={1}>{topic.debateQuestion}</Text>
                                    </View>
                                    <View style={styles.arrowContainer}>
                                        <Text style={[styles.arrow, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}>→</Text>
                                    </View>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.expandedContent}>
                                        <View style={styles.divider} />

                                        <Text style={styles.descriptionLabel}>THE CONTEXT</Text>
                                        <Text style={styles.descriptionText}>
                                            {topic.description || `Current trending discussions surrounding ${topic.title} highlight its growing impact on cultural and social dynamics.`}
                                        </Text>

                                        <View style={styles.newsSection}>
                                            <Text style={styles.newsLabel}>SITUATIONAL PERSPECTIVES:</Text>
                                            <View style={styles.newsGrid}>
                                                {news.map((item) => (
                                                    <TouchableOpacity
                                                        key={item.type}
                                                        style={[styles.newsCard, styles[`newsCard_${item.type}` as keyof typeof styles]]}
                                                        onPress={() => Linking.openURL(item.url)}
                                                    >
                                                        <Text style={styles.newsType}>{item.type.toUpperCase()}</Text>
                                                        <Text style={styles.newsLinkText}>{item.label}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.confirmBtn}
                                            onPress={() => handleConfirm(topic)}
                                        >
                                            <LinearGradient
                                                colors={[COLORS.accentCyan, '#0891B2']}
                                                style={styles.confirmGradient}
                                            >
                                                <Text style={styles.confirmBtnText}>CHOOSE THIS FRONTIER</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
    header: { marginBottom: 30 },
    backBtn: { marginBottom: 15 },
    backText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
    stepTitle: { color: '#06B6D4', fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
    mainTitle: { color: '#FFF', fontSize: 32, fontWeight: '800', letterSpacing: -1 },

    urlTerminal: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: RADIUS.xl,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20
    },
    terminalLabel: { color: '#06B6D4', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
    inputContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    urlInput: {
        height: 50,
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'monospace',
    },
    loadBtn: { height: 55, borderRadius: 12, overflow: 'hidden' },
    loadGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 2 },

    // Matrix
    tableSection: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    tableHeader: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    columnHeader: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    rowContainer: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
    rowExpanded: { backgroundColor: 'rgba(255,255,255,0.02)' },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 18,
        paddingHorizontal: 15,
        alignItems: 'center'
    },
    cell: { justifyContent: 'center' },
    rankText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: '700' },
    trafficText: { color: '#10B981', fontSize: 11, fontWeight: '900' },
    topicTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    topicSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 16 },
    arrowContainer: { width: 20, alignItems: 'flex-end' },
    arrow: { color: '#8B5CF6', fontSize: 18, fontWeight: 'bold' },
    noDataText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40, fontSize: 13 },

    // Expanded Styles
    expandedContent: { padding: 20, paddingTop: 0 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
    descriptionLabel: { color: '#06B6D4', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
    descriptionText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20, marginBottom: 20 },
    newsSection: { marginBottom: 25 },
    newsLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
    newsGrid: { flexDirection: 'row', gap: 10 },
    newsCard: { flex: 1, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    newsCard_positive: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' },
    newsCard_negative: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' },
    newsCard_neutral: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
    newsType: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
    newsLinkText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    confirmBtn: { height: 50, borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: 10 },
    confirmGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    confirmBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 1.5 },
});
