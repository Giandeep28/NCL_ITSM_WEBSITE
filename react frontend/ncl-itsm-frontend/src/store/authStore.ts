import { create } from 'zustand';

export interface AuthUser {
  eisNumber: string;
  fullName: string;
  role: 'Employee' | 'Support Engineer' | 'Asset Manager' | 'IT Administrator' | 'Super Admin' | 'Read Only Auditor';
  departmentId: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken, refreshToken) => set({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: true
  }),
  logout: () => set({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  })
}));
