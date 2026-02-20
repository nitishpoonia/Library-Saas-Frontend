import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { fontFamily } from '../../constants/fonts';

interface DashboardLoaderProps {
  isLoading?: boolean;
  isLibraryIdLoading?: boolean;
  loadingText?: string;
}

const LoadingScreen: React.FC<DashboardLoaderProps> = ({
  isLoading = false,
  isLibraryIdLoading = false,
  loadingText = 'Loading Dashboard',
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!isLoading && !isLibraryIdLoading) {
    return null;
  }

  return (
    <View style={styles.loadingContainer}>
      <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
        {loadingText}
      </Animated.Text>

      <Animated.View style={[styles.dotsContainer, { opacity: fadeAnim }]}>
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </Animated.View>
    </View>
  );
};

// Animated dot component
const LoadingDot = ({ delay }: { delay: number }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.loadingDot, { transform: [{ translateY: bounceAnim }] }]}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1', // Indigo
  },
  loadingText: {
    fontSize: 20,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#252525',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
});

export default LoadingScreen;
