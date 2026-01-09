import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useSession } from '../context/SessionContext';
import mockData from '../constants/mockGlobalBoard.json';

interface BoardScreenProps {
    onClose: () => void;
}

export default function BoardScreen({ onClose }: BoardScreenProps) {
    const { state } = useSession();

    // Combine session commonalities with mock global data
    const sessionItems = state.commonalities.map((c) => c.text);
    const globalItems = mockData.commonalities;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Humanity's Ledger</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
                What we all agree on
            </Text>

            {/* Session Commonalities */}
            {sessionItems.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Your Session</Text>
                    <View style={styles.cloudContainer}>
                        {sessionItems.map((item, index) => (
                            <View key={`session-${index}`} style={styles.sessionTag}>
                                <Text style={styles.sessionTagText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Global Word Cloud */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌍 Global Consensus</Text>
                <ScrollView contentContainerStyle={styles.cloudContainer}>
                    {globalItems.map((item, index) => {
                        // Simulate varying sizes based on "popularity"
                        const scale = 0.8 + (Math.random() * 0.6);
                        const opacity = 0.6 + (Math.random() * 0.4);

                        return (
                            <View
                                key={`global-${index}`}
                                style={[
                                    styles.tag,
                                    {
                                        transform: [{ scale }],
                                        opacity,
                                    },
                                ]}
                            >
                                <Text style={styles.tagText}>{item}</Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: '#fff',
        fontSize: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    section: {
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    cloudContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.5)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 4,
    },
    tagText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
    },
    sessionTag: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.5)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 4,
    },
    sessionTagText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '500',
    },
});
