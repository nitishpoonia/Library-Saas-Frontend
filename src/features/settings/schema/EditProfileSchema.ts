import * as yup from 'yup';

export const editProfileSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),

  email: yup.string().email('Invalid email address').nullable().notRequired(),

  phone: yup
    .string()
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .nullable()
    .notRequired(),
});
