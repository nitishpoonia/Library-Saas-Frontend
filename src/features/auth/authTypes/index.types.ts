export type AuthStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
  LibrarySetup: undefined;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  identifier: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  isLibraryCreated: boolean;
};

export type SignUpResponse = {
  token: string;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  message: string;
  isLibraryCreated: boolean;
};
