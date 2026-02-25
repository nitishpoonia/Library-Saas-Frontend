import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { fontFamily } from '../../constants/fonts';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Dimensions } from 'react-native';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 1.6;
type CardVariant = 'overdue' | 'expiring';

interface StudentFeesCardsProps {
  variant: CardVariant;
  count: number;
  onPress?: () => void;
}

const VARIANT_CONFIG: {
  [key in CardVariant]: {
    backgroundColor: string;
    label: string;
    description: string;
  };
} = {
  overdue: {
    backgroundColor: '#e79595',
    label: 'Overdue',
    description: 'Student fees is overdue',
  },
  expiring: {
    backgroundColor: '#f0b97a',
    label: 'Expiring Soon',
    description: 'Student fees expiring soon',
  },
};

const StudentFeesCards = ({
  variant,
  count,
  onPress,
}: StudentFeesCardsProps) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <View style={[styles.card, { backgroundColor: config.backgroundColor }]}>
      <Text style={styles.label}>{config.label}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Tap to view details</Text>
        <FontAwesome6
          name="arrow-right"
          iconStyle="solid"
          color="white"
          size={14}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    width: CARD_WIDTH,
  },
  label: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: 'white',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.9,
  },
  infoContainer: {
    gap: 2,
  },
  count: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: 'white',
    fontSize: 36,
    lineHeight: 42,
  },
  description: {
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: 'white',
    fontSize: 13,
    opacity: 0.9,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buttonText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: 'white',
    fontSize: 12,
  },
});

export default StudentFeesCards;
