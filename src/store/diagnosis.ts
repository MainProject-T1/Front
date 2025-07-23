import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiagnosisState, DiagnosisResult } from '@/types';

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      results: [],
      currentDiagnosis: null,
      isLoading: false,

      setCurrentDiagnosis: (diagnosis: DiagnosisResult | null) => {
        set({ currentDiagnosis: diagnosis });
      },
      setResults: (newResults: DiagnosisResult[]) => {
        set({ results: newResults });
      },
      // 진단 기록 저장/조회/삭제는 FastAPI(analyzeImageAndSave)에서 직접 처리
      // 필요하다면 여기에 analyzeImageAndSave를 호출하는 메서드를 추가할 수 있음
    }),
    {
      name: 'diagnosis-storage',
      partialize: (state) => ({ 
        results: state.results 
      }),
    }
  )
); 