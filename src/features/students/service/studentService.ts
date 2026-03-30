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

export interface StudentPayment {
  paymentId: number;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  receiptNumber: string;
  notes: string | null;
}

export interface StudentMembership {
  membershipId: number;
  startDate: string;
  endDate: string;
  status: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  timing: string;
  daysRemaining: number;
  seat: {
    seatId: number;
    seatNumber: string;
    hasLocker: boolean;
  } | null;
  payments: StudentPayment[];
}

export interface StudentDetail {
  studentId: number;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberships: StudentMembership[];
}

export interface StudentDetailResponse {
  success: boolean;
  student: StudentDetail;
}

export interface UpdateStudentPayload {
  name: string;
  phone: string;
}

export interface UpdatedStudentSummary {
  studentId: number;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  currentMembership: {
    membershipId: number;
    seatNumber: string;
    status: string;
    endDate: string;
    timing: string;
  } | null;
}

export interface UpdateStudentResponse {
  success: boolean;
  message: string;
  student: UpdatedStudentSummary;
}

export interface RenewMembershipRequest {
  membership_id: number;
  student_id: number;
  amount: number;
  payment_method: string;
  renewal_days: number;
  notes?: string;
  seat_number?: string | number;
  timing?: string;
}

export interface RenewalReceipt {
  receipt_number: string;
  student_name: string;
  seat_number: string | number;
  amount_paid_now: number;
  payment_mode: string;
  payment_date: string;
  membership_status: string;
  old_end_date: string;
  new_end_date: string;
  renewal_days: number;
  total_paid_so_far: number;
  pending_amount: number;
}

export interface RenewedMembership {
  membershipId: number;
  studentId: number;
  libraryId: number;
  status: string;
  startDate: string;
  endDate: string;
  timing: string;
  seatNumber: string | number;
}

export interface MembershipRenewalResponse {
  success: boolean;
  message: string;
  receipt: RenewalReceipt;
  membership: RenewedMembership;
}

export async function addStudent(studentData: student) {
  console.log('Student data', studentData);

  try {
    const res = await apiClientWithAuth.post(
      ENDPOINTS.STUDENT.ADD,
      studentData,
    );
    console.log('Res of addStudent', res.data);

    return res.data;
  } catch (error: any) {
    console.error('Error adding student', error?.response);
    throw new Error(error?.response?.data?.error || 'Failed to add student');
  }
}

export async function getStudentList(
  libraryId: number,
  pageParam: number,
  search: string,
) {
  const res = await apiClientWithAuth.get(
    ENDPOINTS.STUDENT.LIST_OF_STUDENT(libraryId),
    {
      params: {
        page: pageParam,
        limit: 20,
        search,
      },
    },
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

export async function getStudentDetail(
  libraryId: number,
  studentId: number,
): Promise<StudentDetailResponse> {
  try {
    const res = await apiClientWithAuth.get(
      ENDPOINTS.STUDENT.DETAIL(libraryId, studentId),
    );
    return res.data;
  } catch (error: any) {
    console.error('Error fetching student detail', error?.response);
    throw new Error(
      error?.response?.data?.error || 'Failed to fetch student details',
    );
  }
}

export async function updateStudent(
  libraryId: number,
  studentId: number,
  studentData: UpdateStudentPayload,
): Promise<UpdateStudentResponse> {
  try {
    const res = await apiClientWithAuth.put(
      ENDPOINTS.STUDENT.UPDATE(libraryId, studentId),
      studentData,
    );
    return res.data;
  } catch (error: any) {
    console.error('Error updating student', error?.response);
    throw new Error(
      error?.response?.data?.error || 'Failed to update student details',
    );
  }
}

export async function getAvailableSeats({
  libraryId,
  dataForGettingAvailableSeats,
}: {
  libraryId: number;
  dataForGettingAvailableSeats: {
    startTime: string;
    endTime: string;
    bookedFor: number;
  };
}) {
  return apiClientWithAuth
    .post(
      ENDPOINTS.SEAT.GET_AVAILABLE_SEATS(libraryId),
      dataForGettingAvailableSeats,
    )
    .then(res => res.data);
}

export async function renewMembership(
  libraryId: number,
  payload: RenewMembershipRequest,
): Promise<MembershipRenewalResponse> {
  try {
    const res = await apiClientWithAuth.post(
      ENDPOINTS.STUDENT.RENEW_MEMBERSHIP(libraryId),
      payload,
    );
    return res.data;
  } catch (error: any) {
    console.error('Error renewing membership', error?.response);
    throw new Error(
      error?.response?.data?.error || 'Failed to renew membership',
    );
  }
}
