export const formatAmount = (amount: string | number) =>
  `₹${parseFloat(amount?.toString()).toLocaleString('en-IN')}`;
