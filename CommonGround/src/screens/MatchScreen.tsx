import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ColorRoll from '../components/ColorRoll/ColorRoll';

const { width, height } = Dimensions.get('window');

interface MatchScreenProps {
    onMatchComplete: (color: string) => void;
    initialCategory: string;
}

export default function MatchScreen({ onMatchComplete, initialCategory }: MatchScreenProps) {

    const handleMatch = (color: string) => {
        // Navigate after short delay
        setTimeout(() => {
            onMatchComplete(color);
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <ColorRoll onMatch={handleMatch} categoryName={initialCategory} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
});
