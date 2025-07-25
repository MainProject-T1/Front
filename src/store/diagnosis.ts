import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiagnosisState, DiagnosisResult, MockDiagnosisResponse } from '@/types';
import { dataURLtoBlob } from '@/utils';
import { useAuthStore } from './auth'; // useAuthStore import 추가

// Mock 진단 결과 데이터 (AI 모델 연결 전까지 사용)
/*
const mockDiagnosisResponses: MockDiagnosisResponse[] = [
  {
    diseaseName: '아토피 피부염',
    description: '만성적이고 재발성을 보이는 염증성 피부질환으로, 가려움증과 특징적인 피부 병변을 동반합니다.',
    recommendations: [
      '보습제를 하루 2-3회 사용하세요',
      '미지근한 물로 짧게 샤워하세요',
      '자극적인 비누나 세제 사용을 피하세요',
      '면 소재의 옷을 착용하세요'
    ],
    detailedInfo: '아토피 피부염은 전 세계적으로 흔한 만성 염증성 피부질환입니다. 주로 영유아기에 시작되어 소아기, 성인기까지 지속될 수 있습니다. 유전적 소인과 환경적 요인이 복합적으로 작용하여 발생합니다.'
  },
  {
    diseaseName: '지루성 피부염',
    description: '피지 분비가 활발한 부위에 발생하는 만성 염증성 피부질환입니다.',
    recommendations: [
      '항진균 샴푸를 사용하세요',
      '스트레스를 관리하세요',
      '적절한 세안을 유지하세요',
      '기름진 음식을 피하세요'
    ],
    detailedInfo: '지루성 피부염은 말라세지아 효모균과 관련이 있으며, 스트레스, 면역력 저하, 호르몬 변화 등이 악화 요인이 될 수 있습니다.'
  },
  {
    diseaseName: '건선',
    description: '면역체계 이상으로 인한 만성 자가면역성 피부질환입니다.',
    recommendations: [
      '피부과 전문의 진료를 받으세요',
      '스트레스 관리가 중요합니다',
      '금연과 금주를 권장합니다',
      '적절한 체중을 유지하세요'
    ],
    detailedInfo: '건선은 T세포 매개 자가면역질환으로, 유전적 소인과 환경적 요인이 함께 작용합니다. 조기 진단과 적절한 치료가 매우 중요합니다.'
  }
];

// Mock AI 진단 함수
const mockAiDiagnosis = (imageData: string): Promise<MockDiagnosisResponse> => {
  return new Promise((resolve) => {
    // 실제 AI 처리 시뮬레이션을 위한 지연
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockDiagnosisResponses.length);
      resolve(mockDiagnosisResponses[randomIndex]);
    }, 2000); // 2초 지연
  });
};
*/

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      results: [],
      currentDiagnosis: null,
      isLoading: false,

      addDiagnosisResult: (result: DiagnosisResult) => {
        set((state) => ({
          results: [result, ...state.results.filter(r => r.id !== result.id)],
          currentDiagnosis: result,
        }));
      },

      setCurrentDiagnosis: (diagnosis: DiagnosisResult | null) => {
        set({ currentDiagnosis: diagnosis });
      },

      deleteDiagnosisResult: (id: string) => {
        set((state) => ({
          results: state.results.filter(result => result.id !== id),
          currentDiagnosis: state.currentDiagnosis?.id === id ? null : state.currentDiagnosis,
        }));
      },
    }),
    {
      name: 'diagnosis-storage',
      partialize: (state) => ({
        results: state.results.map(({ image, ...rest }) => rest),
        currentDiagnosis: state.currentDiagnosis ? { ...state.currentDiagnosis, image: '' } : null,
      }),
    }
  )
);

// AI 진단 요청 함수 (별도 export)
export const requestDiagnosis = async (
  image: string, 
  userId: string | null // userId는 null일 수 있음
): Promise<DiagnosisResult> => {
  console.log('[requestDiagnosis] 진단 요청 시작...');

  const token = useAuthStore.getState().token; // zustand 스토어에서 직접 토큰 가져오기
  const headers: HeadersInit = {
    // FormData를 사용할 때는 Content-Type을 명시적으로 설정하지 않음
  };

  // 토큰이 있을 경우에만 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Base64를 Blob으로 변환
  const imageBlob = dataURLtoBlob(image);
  if (!imageBlob) {
    throw new Error('이미지 변환에 실패했습니다.');
  }

  // FormData 생성
  const formData = new FormData();
  formData.append('image', imageBlob, 'diagnosis-image.jpg');
  if (userId) {
    formData.append('userId', userId); // userId가 있을 경우에만 추가
  }

  try {
    const response = await fetch('http://localhost:3002/api/diagnose', {
      method: 'POST',
      headers,
      body: formData, 
    });

    console.log('[requestDiagnosis] 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: '서버 응답을 파싱할 수 없습니다.',
        details: response.statusText,
      }));
      console.error('[requestDiagnosis] 서버 오류 응답:', errorData);
      throw new Error(
        `서버 오류: ${errorData.error || '알 수 없는 오류'}. 상세: ${
          errorData.details || '없음'
        }`
      );
    }

    const data = await response.json();
    console.log('[requestDiagnosis] AI 진단 결과 수신:', data);

    // 백엔드 응답 형식에 맞춰 결과 객체 생성 (수정됨)
    const newResult: DiagnosisResult = {
      id: data.id ? data.id.toString() : Date.now().toString(),
      userId: userId,
      image, // 원본 이미지는 상태에 저장하기 위해 유지
      diseaseName: data.diseaseName || '알 수 없는 질병',
      description: data.description || '설명이 없습니다.',
      recommendations: data.recommendations || [],
      detailedInfo: data.detailedInfo || data.description || '상세 정보가 없습니다.',
      diagnosisDate: data.diagnosisDate || new Date().toISOString(),
      confidence: data.confidence || 0,
    };

    return newResult;
  } catch (error) {
    console.error('Diagnosis error:', error);
    if (error instanceof Error) {
      throw new Error(`네트워크 오류 또는 서버 문제: ${error.message}`);
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
};