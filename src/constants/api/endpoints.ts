export const ENDPOINTS = {
  AUTH: {
    SIGN_IN: "/owners/login",
    SIGN_UP: "/owners/signup",
  },
  LIBRARIES: {
    CREATE: "/libraries",
    OVERVIEW: (libraryId: number) => `/libraries/${libraryId}/overview`,
    ALL_LIBRARIES: "/libraries/my-libraries",
  },
  DASHBOARD: {
    OVERVIEW: (libraryId: number) =>
      `/libraries/${libraryId}/dashboard-overview`,
  },
  STUDENT: {
    ADD: "/libraries/student/add-student",
    LIST_OF_STUDENT: (libraryId: number) =>
      `/libraries/student/${libraryId}/all-students`,
    DELETE: "/libraries/student/delete-student",
  },
  EXPENSE: {
    ADD: (libraryId: number) => `/libraries/${libraryId}/add-expense`,
    LIST_ALL_EXPENSES: (libraryId: number) =>
      `/libraries/${libraryId}/list-all-expenses`,
  },
  SEAT: {
    GET_AVAILABLE_SEATS: (libraryId: number) =>
      `/seats/${libraryId}/available-seats`,
  },

  PROFILE: {
    GET_USER_PROFILE: "/profile/my-profile",
    UPDATE_USER_PROFILE: "/profile/update-profile",
    CHANGE_PASSWORD: "/profile/change-password",
  },
} as const;

export type EndpointGroups = typeof ENDPOINTS;
