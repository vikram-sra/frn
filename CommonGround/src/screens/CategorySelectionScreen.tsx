import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSession } from '../context/SessionContext';

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

export default function CategorySelectionScreen() {
    const { dispatch } = useSession();

    const handleSelect = (category: string) => {
        dispatch({ type: 'SET_CATEGORY', category });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SELECT A TOPIC</Text>
                <Text style={styles.subtitle}>TODAY'S TRENDING</Text>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {TRENDING_TOPICS.map((topic, index) => (
                    <TouchableOpacity
                        key={topic}
                        style={styles.card}
                        onPress={() => handleSelect(topic)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.index}>{(index + 1).toString().padStart(2, '0')}</Text>
                        <Text style={styles.topic}>{topic}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 4,
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderRadius: 0,
        borderLeftWidth: 4,
        borderLeftColor: '#333',
    },
    index: {
        fontSize: 24,
        fontWeight: '900',
        color: '#333',
        marginRight: 24,
        fontVariant: ['tabular-nums'],
    },
    topic: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
    },
});
