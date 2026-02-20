import * as yup from 'yup';

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
  newPassword: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});
