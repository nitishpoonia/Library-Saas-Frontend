import { View, Text, StyleSheet } from 'react-native';
import React, { memo } from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { fontFamily } from '../../../constants/fonts';
import { formatAmount } from '../../../utils/FormatAmount';

const ExpenseCard = memo(item => {
  console.log('EXpense item', item);
  const nestedItem = item.item;
  return (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseIcon}>
          <FontAwesome6
            iconStyle="solid"
            name="file-invoice"
            size={20}
            color="#3b82f6"
          />
        </View>

        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>{nestedItem.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{nestedItem.category}</Text>
          </View>
          <Text style={styles.categoryText}>
            {new Date(nestedItem.expense_date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',

              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>
            {formatAmount(nestedItem.amount)}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default ExpenseCard;
const styles = StyleSheet.create({
  expenseCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginBottom: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    gap: 6,
  },
  expenseTitle: {
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#000',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.medium,
    opacity: 0.8,
    color: '#000',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#ef4444',
  },
});
