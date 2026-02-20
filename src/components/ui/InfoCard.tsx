import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fontFamily } from '../../constants/fonts';

interface InfoCardProps {
  title: string;
  value: string;
  subtitle?: string;
  variant?: 'default' | 'outlined';
  valueColor?: string;
  borderColor?: string;
  style?: ViewStyle;
}
const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  subtitle,
  variant = 'default',
  valueColor,
  borderColor,
  style,
}) => {
  const cardStyle: ViewStyle[] = [
    styles.card,
    variant === 'outlined' && styles.cardOutlined,
    borderColor && { borderColor },
    style,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={cardStyle}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardOutlined: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
  },
  cardTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },
  cardValue: {
    fontSize: 24,
    fontFamily: fontFamily.MONTSERRAT.bold,

    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
});

export default InfoCard;
