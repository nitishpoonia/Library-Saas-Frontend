import { StyleSheet } from 'react-native';
import { fontFamily } from '../../constants/fonts';

export const CommonStyles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.MONTSERRAT.bold,
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    borderColor: '#526ea8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
    marginRight: 8,
    color: '#526ea8',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    // Added this width to fix input flickering issue
    width: 260,
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: fontFamily.MONTSERRAT.regular,
    lineHeight: 18,
  },
  linkTextInline: {
    color: '#6366F1',
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },

  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.bold,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
  linkText: {
    fontSize: 14,
    color: '#6366F1',
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
});
