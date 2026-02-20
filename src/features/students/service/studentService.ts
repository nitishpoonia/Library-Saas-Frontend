import { apiClientWithAuth, ENDPOINTS } from '../../../constants/api';

type student = {
  name: string;
  phone: string;
  seat_number: string;
  timing: string;
  booked_for: number;
  payment_method: string;
  amount: string;
  libarary_id: number;
};

export async function addStudent(studentData: student) {
  const res = await apiClientWithAuth.post(ENDPOINTS.STUDENT.ADD, studentData);
  console.log('Res of addStudent', res.data);

  return res.data;
}

export async function getStudentList(libraryId: number) {
  const res = await apiClientWithAuth.get(
    ENDPOINTS.STUDENT.LIST_OF_STUDENT(libraryId),
  );
  return res.data;
}

export async function deleteStudent(studentData: any) {
  const res = await apiClientWithAuth.delete(ENDPOINTS.STUDENT.DELETE, {
    data: {
      student_id: studentData,
    },
  });
  return res.data;
}

export async function getAvailableSeats({
  libraryId,
  dataForGettingAvailableSeats,
}) {
  return apiClientWithAuth
    .post(
      ENDPOINTS.SEAT.GET_AVAILABLE_SEATS(libraryId),
      dataForGettingAvailableSeats,
    )
    .then(res => res.data);
}
