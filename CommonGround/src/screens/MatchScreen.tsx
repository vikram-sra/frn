import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ColorRoll from '../components/ColorRoll/ColorRoll';
import { COLORS } from '../constants/theme';

interface MatchScreenProps {
    onMatchComplete: (color: string) => void;
    initialCategory: string;
}

export default function MatchScreen({ onMatchComplete, initialCategory }: MatchScreenProps) {
    const handleMatch = (color: string) => {
        // Navigate after delay to let haptics and animations finish
        setTimeout(() => {
            onMatchComplete(color);
        }, 600);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#030712', '#0F172A', '#030712']}
                style={StyleSheet.absoluteFill}
            />
            <ColorRoll onMatch={handleMatch} categoryName={initialCategory} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
});
