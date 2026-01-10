import React, { useRef, useEffect, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

interface ParticleBackgroundProps {
    count?: number;
    color?: string;
}

/**
 * 🌟 SHARED PARTICLE BACKGROUND
 * A performant, memoized component for background animations.
 * Handles its own animation lifecycle and cleanup.
 */
export const ParticleBackground = memo(({ count = 30, color = COLORS.starWhite }: ParticleBackgroundProps) => {
    const particles = useRef(
        Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 2.5,
            opacity: new Animated.Value(0.1 + Math.random() * 0.3),
            duration: 3000 + Math.random() * 4000,
        }))
    ).current;

    useEffect(() => {
        const animations: Animated.CompositeAnimation[] = [];

        particles.forEach((particle) => {
            const createAnimation = () => {
                const anim = Animated.sequence([
                    Animated.timing(particle.opacity, {
                        toValue: 0.4 + Math.random() * 0.3,
                        duration: particle.duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.opacity, {
                        toValue: 0.1 + Math.random() * 0.2,
                        duration: particle.duration,
                        useNativeDriver: true,
                    }),
                ]);

                anim.start(() => {
                    // Start next cycle if component is still mounted
                    createAnimation();
                });

                animations.push(anim);
            };

            createAnimation();
        });

        return () => {
            // 🛑 CLEANUP: Stop all animations on unmount
            animations.forEach(anim => anim.stop());
        };
    }, [particles]);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((particle, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.particle,
                        {
                            left: particle.x,
                            top: particle.y,
                            width: particle.size,
                            height: particle.size,
                            opacity: particle.opacity,
                            backgroundColor: color,
                        },
                    ]}
                />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        borderRadius: 10,
    },
});
