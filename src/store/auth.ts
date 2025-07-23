import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';

// TODO: 실제 배포 시 mockUsers를 삭제하고, DB에서 사용자 정보를 받아오도록 수정해야 합니다.
// const mockUsers: User[] = [
//   {
//     id: '1',
//     name: '홍길동', // ← 테스트용. 실제 배포 시 DB 연동 필요
//     email: 'test@example.com', // ← 테스트용. 실제 배포 시 DB 연동 필요
//     password: 'password123',
//     birthDate: '1990-01-01',
//     phoneNumber: '010-1234-5678',
//     profileImage: '',
//     createdAt: new Date().toISOString(),
//   }
// ];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
                    const res = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (!res.ok) return false;
          const data = await res.json();
          if (data.user && data.token) {
            set({ user: data.user, isAuthenticated: true });
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      },

      register: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
        try {
          // 백엔드 API가 기대하는 데이터 구조로 변환
          const { name, email, password, birthDate, phoneNumber } = userData;
          const apiUserData = {
            name,
            email,
            password,
            birth: birthDate, // birthDate -> birth
            phone: phoneNumber, // phoneNumber -> phone
          };

                    const res = await fetch('http://localhost:3002/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiUserData)
          });
          if (!res.ok) return false;
          const data = await res.json();
          if (data.user && data.token) {
            // 회원가입 후 자동 로그인 (원하면 set({ user: data.user, isAuthenticated: true }) 가능)
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
          // 실제 API 연동 필요 (PUT /api/auth/profile)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 