// import { get } from '@gluestack-style/react';
import { getToken, saveToken } from '@/utils/useStorageState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  userInfo: {
    id?: string;
    userName?: string;
    email?: string;
    passWord: string;
  };
  login: (token: string, userInfo?: {id?: string, userName?: string, email?: string, passWord: string}) => void;
  logout: () => void;
  getState: (state: any) => string;
  initialize: () => Promise<void>;
}

type PersistedAuthState = Pick<AuthState, 'token' | 'isLoggedIn'>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      isLoggedIn: false,
      userInfo: {
        passWord: ''
      },
      login: async (token, userInfo) => {
        try {
          await saveToken(token);
          set({ token, isLoggedIn: true, userInfo: userInfo || {passWord: ''} });
        } catch (error) {
          console.error('Failed to save token:', error);
          set({ token: '', isLoggedIn: false, userInfo: {passWord: ''} });
        }
      },
      logout: async () => {
        try {
          await saveToken('');
          set({ token: '', isLoggedIn: false, userInfo: {passWord: ''} });
        } catch (error) {
          console.error('Failed to clear token:', error);
        }
      },
      getState: (state) => {
        return state.token;
      },
      initialize: async () => {
        try {
          const token = await getToken();
          if (token && token !== 'tokenKey') {
            set({ token, isLoggedIn: true });
          }
        } catch (error) {
          console.error('Failed to initialize auth store:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState): PersistedAuthState => ({ 
        token: state.token, 
        isLoggedIn: state.isLoggedIn 
      }),
      skipHydration: true,
    }
  )
);