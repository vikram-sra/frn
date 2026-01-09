import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SessionProvider, useSession } from './src/context/SessionContext';
import MatchScreen from './src/screens/MatchScreen';
import TableView from './src/components/TableView/TableView';
import CategorySelectionScreen from './src/screens/CategorySelectionScreen';
import BoardScreen from './src/screens/BoardScreen';
import { botController } from './src/bots/BotController';
import { COLORS } from './src/constants/theme';

// ═══════════════════════════════════════════════════════════════
// 🌟 MAIN APP CONTENT
// ═══════════════════════════════════════════════════════════════
function AppContent() {
  const { state, dispatch } = useSession();
  const [matchColor, setMatchColor] = useState<string>('#A855F7');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Smooth transition between screens
  const transitionToScreen = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 200);
  };

  const handleMatchComplete = (color: string) => {
    setMatchColor(color);
    botController.resetBot();

    transitionToScreen(() => {
      dispatch({
        type: 'START_SESSION',
        botName: botController.getCurrentBot().name,
        matchColor: color
      });
    });
  };

  // Category Selection Phase
  if (state.phase === 'category_select') {
    return (
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        <CategorySelectionScreen />
      </Animated.View>
    );
  }

  // Matching Phase
  if (state.phase === 'matching') {
    return (
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        <MatchScreen
          onMatchComplete={handleMatchComplete}
          initialCategory={state.category}
        />
      </Animated.View>
    );
  }

  // Board/History Phase
  if (state.phase === 'board') {
    return (
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        <BoardScreen onClose={() => dispatch({ type: 'RESET_SESSION' })} />
      </Animated.View>
    );
  }

  // Active or Summary phase
  return (
    <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
      <TableView matchColor={matchColor} />
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🚀 APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  return (
    <SessionProvider>
      <View style={styles.container}>
        {/* Deep space gradient background */}
        <LinearGradient
          colors={['#030712', '#0F172A', '#030712']}
          style={StyleSheet.absoluteFill}
        />
        <StatusBar style="light" />
        <AppContent />
      </View>
    </SessionProvider>
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
  screenContainer: {
    flex: 1,
  },
});
