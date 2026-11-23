import { User } from '@/types';

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  expiresIn: string;
}
