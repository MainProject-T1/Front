import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (email, password) => {
        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '로그인에 실패했습니다.');
          }

          const { user, token } = await response.json();
          set({ user, isAuthenticated: true, token });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ user: null, isAuthenticated: false, token: null });
          return false;
        }
      },

      register: async (userData) => {
        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '회원가입에 실패했습니다.');
          }

          // 회원가입 성공 시 바로 로그인 처리
          const { user, token } = await response.json();
          set({ user, isAuthenticated: true, token });
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
      },

      updateProfile: async (updates) => {
        const { user, token } = get();
        if (!user || !token) return;

        try {
          const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error('프로필 업데이트에 실패했습니다.');
          }

          const updatedUser = await response.json();
          set({ user: updatedUser.user });
        } catch (error) {
          console.error('Update profile error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 토큰이 있으면 인증된 상태로 간주합니다.
          state.isAuthenticated = !!state.token;
        }
      }
    }
  )
);