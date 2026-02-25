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

export const editLibrarySchema = yup.object({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  address: yup
    .string()
    .min(3, 'Address must be at least 3 characters')
    .required('Address is required'),
  seats: yup
    .number()
    .typeError('Seats must be a number')
    .positive('Seats must be greater than 0')
    .integer('Seats must be a whole number')
    .required('Seats are required'),
});
