import { get } from '@gluestack-style/react';
import { create } from 'zustand';
import { persist,createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  userInfo: {
    id?: string;
    userName?: string;
    email?: string;
    passWord:string
  };
  login: (token: string, userInfo?: {id?: string, userName?: string, email?: string, passWord: string}) => void;
  logout: () => void;
  getState: (state: any) => string;
}
export const useAuthStore = create<AuthState>()((set) => ({
  token: '',
  isLoggedIn: false,
  userInfo: {
    passWord: ''
  },
  login: (token, userInfo?: {id?: string, userName?: string, email?: string, passWord: string}) => set({ token, isLoggedIn: true, userInfo: userInfo || {passWord: ''} }),
  logout: () => set({ token: '', isLoggedIn: false, userInfo: {passWord: ''} }),
  getState: (state) => {
    return state.token;
  }
}))