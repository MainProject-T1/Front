'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useDiagnosisStore } from '@/store/diagnosis';
import { formatDateTime } from '@/utils';
import type { DiagnosisResult } from '@/types';

const DiagnosisResultPage = () => {
  const router = useRouter();
  const params = useParams();
  const { results, setCurrentDiagnosis, addDiagnosisResult } = useDiagnosisStore();
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnosis = async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        const response = await fetch(`${apiUrl}/api/diagnosis/${id}`);
        if (!response.ok) {
          throw new Error('진단 정보를 불러오는 데 실패했습니다.');
        }
        const data: DiagnosisResult = await response.json();
        setDiagnosis(data);
        setCurrentDiagnosis(data); // 스토어에도 현재 진단으로 설정
        // 스토어에 데이터가 없다면 추가
        if (!results.find(r => r.id === data.id)) {
          addDiagnosisResult(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
        setDiagnosis(null);
      } finally {
        setIsLoading(false);
      }
    };

    const id = params.id as string;
    if (id) {
      const foundDiagnosis = results.find(result => result.id === id);
      if (foundDiagnosis) {
        setDiagnosis(foundDiagnosis);
        setCurrentDiagnosis(foundDiagnosis);
        setIsLoading(false);
      } else {
        fetchDiagnosis(id);
      }
    }
  }, [params.id, results, setCurrentDiagnosis, addDiagnosisResult]);

  const handleSave = () => {
    // 진단 결과가 이미 스토어에 저장되어 있으므로 진료기록으로 이동
    router.push('/records');
  };

  const handleClose = () => {
    // X 버튼 클릭 시 진단 결과를 저장하지 않고 카메라로 돌아감
    if (diagnosis) {
      // 현재 진단 결과를 스토어에서 제거
      const { deleteDiagnosisResult } = useDiagnosisStore.getState();
      deleteDiagnosisResult(diagnosis.id);
    }
    router.push('/diagnosis');
  };

  const handleViewDetails = () => {
    if (diagnosis) {
      router.push(`/records/${diagnosis.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">진단 결과를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-center p-4 bg-red-100 rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-800">오류</p>
          <p className="mt-2 text-red-600">{error}</p>
          <button onClick={() => router.back()} className="mt-4 btn btn-primary">이전으로</button>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">진단 결과를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-container" style={{ paddingBottom: '100px' }}>
        
        {/* 베젤 고려 상단 공간 */}
        <div style={{ height: 'max(20px, env(safe-area-inset-top))' }}></div>
        
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-md)',
          width: '85%',
          margin: '0 auto var(--space-xl)', // 가운데 정렬 & 좌우 여백 확보
          color: 'var(--text-inverse)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}>
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 'var(--space-md)',
              right: 'var(--space-md)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <X size={20} />
          </button>
          
          <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'bold',
              color: 'var(--text-inverse)',
              marginBottom: 'var(--space-xs)'
            }}>
              진단 완료
            </h1>
            <p style={{
              fontSize: 'var(--text-base)',
              opacity: 0.9
            }}>
              AI 분석 결과입니다
            </p>
          </div>
        </div>

        {/* 진단 이미지 */}
        <div className="card animate-scale-in" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            width: '100%',
            height: '200px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            marginBottom: 'var(--space-lg)'
          }}>
            <img 
              src={diagnosis.image} 
              alt="진단 이미지" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>

        {/* 진단 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* 질병명 */}
          <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="card-content">
              <h1 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                textAlign: 'center',
                lineHeight: '1.3',
                marginBottom: 'var(--space-lg)'
              }}>
                {diagnosis.diseaseName}
              </h1>
            </div>
          </div>

          {/* 진단 설명 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}>
              <h3 className="card-title">진단 설명</h3>
            </div>
            <div className="card-content">
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                {diagnosis.description}
              </p>
            </div>
          </div>

          {/* 권장사항 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-md)'
              }}>권장사항</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {diagnosis.recommendations
                .filter(rec => rec !== '특별한 권장사항이 없습니다.')
                .map((recommendation, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-sm)'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    marginTop: '8px',
                    flexShrink: 0
                  }}></div>
                  <p style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    {recommendation}
                  </p>
                </div>
              ))}

              {/* 중요한 안내 문구 (항상 표시) */}
              <div style={{ 
                marginTop: 'var(--space-sm)', 
                paddingTop: 'var(--space-sm)', 
                borderTop: '1px solid var(--border-color)' 
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-main)', // 검정색 계열 텍스트
                  lineHeight: '1.5'
                }}>
                  이 진단 결과는 AI 분석을 통한 참고 자료입니다. 정확한 진단과 치료를 위해서는 반드시 피부과 전문의의 진료를 받으시기 바랍니다.
                </p>
              </div>
            </div>
          </div>

          {/* 진단 날짜 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--text-sm)',
            marginTop: 'var(--space-lg)'
          }}>
            <Calendar size={16} />
            <span>{formatDateTime(diagnosis.diagnosisDate)}</span>
          </div>

          {/* 액션 버튼들 */}
          <div className="animate-fade-in" style={{ 
            animationDelay: '0.4s',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            paddingTop: 'var(--space-lg)'
          }}>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{
                minHeight: '56px',
                fontSize: 'var(--text-lg)',
                fontWeight: '600'
              }}
            >
              진료기록에 저장
            </button>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-md)'
            }}>
              <button
                onClick={handleViewDetails}
                className="btn btn-secondary"
                style={{
                  minHeight: '48px',
                  fontSize: 'var(--text-base)'
                }}
              >
                상세보기
              </button>
              
              <button
                onClick={() => router.push('/chat')}
                className="btn btn-secondary"
                style={{
                  minHeight: '48px',
                  fontSize: 'var(--text-base)'
                }}
              >
                상담하기
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 바텀 네비게이션 */}
      <BottomNavigation />
    </div>
  );
};

export default DiagnosisResultPage;