import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native'; // Removed StatusBar from here to avoid conflict with expo-status-bar
import { SessionProvider, useSession } from './src/context/SessionContext';
import MatchScreen from './src/screens/MatchScreen';
import TableView from './src/components/TableView/TableView';
import CategorySelectionScreen from './src/screens/CategorySelectionScreen';
import { botController } from './src/bots/BotController';

function AppContent() {
  const { state, dispatch } = useSession();
  const [matchColor, setMatchColor] = useState<string>('#3B82F6');

  // Match Screen completes -> Start Session
  const handleMatchComplete = (color: string) => {
    setMatchColor(color);
    dispatch({ type: 'START_SESSION' });

    // Start autonomous dumping
    // botController.startDumping(state.category); // TODO: implement startDumping
  };

  if (state.phase === 'category_select') {
    return <CategorySelectionScreen />;
  }

  if (state.phase === 'matching') {
    return <MatchScreen onMatchComplete={handleMatchComplete} initialCategory={state.category} />;
  }

  // Active or Summary phase (TableView handles summary overlay)
  return <TableView matchColor={matchColor} />;
}

export default function App() {
  return (
    <SessionProvider>
      <View style={styles.container}>
        <StatusBar style="light" /> {/* Using Expo's StatusBar for consistency with original */}
        <AppContent />
      </View>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
