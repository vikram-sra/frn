import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SessionProvider } from './src/context/SessionContext';
import MatchScreen from './src/screens/MatchScreen';

export default function App() {
  return (
    <SessionProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <MatchScreen />
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
