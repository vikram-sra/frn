import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import ColorRoll from '../components/ColorRoll/ColorRoll';
import TableView from '../components/TableView/TableView';
import { useSession } from '../context/SessionContext';

type Screen = 'match' | 'table' | 'board';

export default function MatchScreen() {
    const { dispatch } = useSession();
    const [currentScreen, setCurrentScreen] = useState<Screen>('match');
    const [matchColor, setMatchColor] = useState('#3B82F6');

    const handleMatch = (color: string) => {
        setMatchColor(color);
        dispatch({ type: 'SET_MATCHED', color });

        // Transition to table view
        setTimeout(() => {
            setCurrentScreen('table');
        }, 500);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            {currentScreen === 'match' && <ColorRoll onMatch={handleMatch} />}
            {currentScreen === 'table' && <TableView matchColor={matchColor} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});
