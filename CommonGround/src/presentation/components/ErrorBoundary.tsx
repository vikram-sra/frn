import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * 🛡️ ERROR BOUNDARY
 * Catches rendering errors and provides a graceful fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <LinearGradient
                        colors={['#030712', '#1E1B4B']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.content}>
                        <Text style={styles.icon}>⚠️</Text>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            An unexpected error occurred. Our team has been notified.
                        </Text>

                        {__DEV__ && (
                            <View style={styles.debugContainer}>
                                <Text style={styles.debugText}>{this.state.error?.toString()}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>TRY AGAIN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '80%',
        alignItems: 'center',
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    icon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 20,
        fontWeight: TYPOGRAPHY.weightBlack,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    message: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    debugContainer: {
        width: '100%',
        padding: SPACING.md,
        backgroundColor: 'rgba(255,0,0,0.1)',
        borderRadius: RADIUS.md,
        marginBottom: SPACING.xl,
    },
    debugText: {
        fontSize: 10,
        color: '#FCA5A5',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    button: {
        backgroundColor: COLORS.accentPurple,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    buttonText: {
        color: 'white',
        fontWeight: TYPOGRAPHY.weightBold,
        letterSpacing: 1,
    },
});
