import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { fontFamily } from '../../constants/fonts';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

const WHATSAPP_URL = 'https://wa.me/919521337968';

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
}) => {
  const handleContactSupport = () => {
    Linking.openURL(WHATSAPP_URL);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Subscription Required</Text>

          <Text style={styles.message}>
            Your trial period has ended. You need an active subscription to add
            new students or expenses. Please contact support to activate your
            subscription.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.supportButton]}
              onPress={handleContactSupport}
              activeOpacity={0.8}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#6B7280',
  },
  closeButtonText: {
    fontSize: 15,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#FFFFFF',
  },
  supportButton: {
    backgroundColor: '#25D366',
  },
  supportButtonText: {
    fontSize: 15,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#FFFFFF',
  },
});

export default SubscriptionModal;
