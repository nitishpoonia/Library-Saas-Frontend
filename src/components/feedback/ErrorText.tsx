import { Text, StyleSheet } from 'react-native';
import React from 'react';
import { fontFamily } from '../../constants/fonts';

const ErrorText = ({ message }: { message?: string }) => (
  <Text style={styles.errorText}>{message}</Text>
);

export default ErrorText;

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
});
