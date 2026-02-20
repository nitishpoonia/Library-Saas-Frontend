import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CustomToastProps {
  text1?: string;
  text2?: string;
  type: ToastType;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

const CustomToast: React.FC<CustomToastProps> = ({ text1, text2, type }) => {
  const backgroundColor: Record<ToastType, string> = {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
  };

  return (
    <View
      style={[styles.container, { backgroundColor: backgroundColor[type] }]}
    >
      {text1 && <Text style={styles.text1}>{text1}</Text>}
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: props => <CustomToast {...props} type="success" />,
  error: props => <CustomToast {...props} type="error" />,
  warning: props => <CustomToast {...props} type="warning" />,
  info: props => <CustomToast {...props} type="info" />,
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toast config={toastConfig} />
    </>
  );
};
