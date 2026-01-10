import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SessionProvider, useSession } from './src/presentation/context/SessionContext';
import MatchScreen from './src/presentation/screens/MatchScreen';
import TableView from './src/presentation/components/TableView/TableView';
import CategorySelectionScreen from './src/presentation/screens/CategorySelectionScreen';
import IdentityRevealScreen from './src/presentation/screens/IdentityRevealScreen';
import OpponentSelectionScreen from './src/presentation/screens/OpponentSelectionScreen';
import BoardScreen from './src/presentation/screens/BoardScreen';
import { botController, BOT_PERSONAS, BotId } from './src/data/services/BotService';
import { COLORS } from './src/presentation/theme';
import { ErrorBoundary } from './src/presentation/components/ErrorBoundary';

// ═══════════════════════════════════════════════════════════════
// 🌟 MAIN APP CONTENT
// ═══════════════════════════════════════════════════════════════
function AppContent() {
  const { state, dispatch } = useSession();
  const [matchColor, setMatchColor] = useState<string>('#A855F7');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevPhase = useRef(state.phase);

  // Automatic transition when phase changes
  useEffect(() => {
    if (prevPhase.current !== state.phase) {
      // Direct jump? No, let's animate
      fadeAnim.setValue(0);
      slideAnim.setValue(30);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      prevPhase.current = state.phase;
    }
  }, [state.phase]);

  const handleMatchComplete = (color: string) => {
    setMatchColor(color);

    if (state.opponentMode !== 'Human Match') {
      const selectedBot = BOT_PERSONAS.find(b => b.name === state.opponentMode);
      if (selectedBot) {
        botController.setBot(selectedBot.id as BotId);
      }
    } else {
      botController.resetBot();
    }

    dispatch({
      type: 'START_SESSION',
      botName: state.opponentMode === 'Human Match' ? 'Match' : state.opponentMode,
      matchColor: color
    });
  };

  const renderScreen = () => {
    switch (state.phase) {
      case 'identity_reveal':
        return <IdentityRevealScreen />;
      case 'opponent_select':
        return <OpponentSelectionScreen />;
      case 'category_select':
        return <CategorySelectionScreen />;
      case 'matching':
        return (
          <MatchScreen
            onMatchComplete={handleMatchComplete}
            initialCategory={state.category}
          />
        );
      case 'board':
        return <BoardScreen onClose={() => dispatch({ type: 'RESET_SESSION' })} />;
      case 'active':
      default:
        return <TableView matchColor={matchColor} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.screenContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >{renderScreen()}</Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🚀 APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
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
