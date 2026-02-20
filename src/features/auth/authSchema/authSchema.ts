import * as yup from 'yup';

export const signUpSchema = yup.object({
  name: yup.string().required('Name is required'),
  identifier: yup
    .string()
    .required('Email or phone is required')
    .test(
      'email-or-phone',
      'Enter valid email or phone',
      value => /\S+@\S+\.\S+/.test(value) || /^[0-9]{10}$/.test(value),
    ),
  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
  agreedToTerms: yup
    .boolean()
    .required('You must agree to the Terms & Conditions')
    .oneOf([true], 'You must agree to the Terms & Conditions'),
});

export const signInSchema = yup.object({
  identifier: yup
    .string()
    .required('Email or phone is required')
    .test(
      'email-or-phone',
      'Enter valid email or phone',
      value => /\S+@\S+\.\S+/.test(value) || /^[0-9]{10}$/.test(value),
    ),
  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
  agreedToTerms: yup
    .boolean()
    .required('You must agree to the Terms & Conditions')
    .oneOf([true], 'You must agree to the Terms & Conditions'),
});

export const librarySetupSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Library name is required')
    .min(3, 'Library name must be at least 3 characters'),
  seats: yup
    .number()
    .typeError('Seats must be a number')
    .required('Number of seats is required')
    .positive('Seats must be a positive number')
    .integer('Seats must be a whole number')
    .min(1, 'At least 1 seat is required'),
  address: yup
    .string()
    .trim()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),
});
