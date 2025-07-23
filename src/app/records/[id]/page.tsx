'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useDiagnosisStore } from '@/store/diagnosis';
import { formatDateTime, getRiskLevelText } from '@/utils';

// 위험도 안전 함수
const safeRiskLevel = (level: string | undefined): 'low' | 'medium' | 'high' => {
  if (level === 'medium' || level === 'high' || level === 'low') return level;
  return 'low';
};

const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'low':
      return <CheckCircle size={20} className="text-green-600" />;
    case 'medium':
      return <Info size={20} className="text-yellow-600" />;
    case 'high':
      return <AlertTriangle size={20} className="text-red-600" />;
  }
};

const RecordDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { results } = useDiagnosisStore();
  const [diagnosis, setDiagnosis] = useState<any>(null);

  useEffect(() => {
    const id = params.id as string;
    const found = results.find((r: any) => r.id === id);
    if (found) setDiagnosis(found);
    else router.push('/records');
  }, [params.id, results, router]);

  if (!diagnosis) return null;

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
          margin: '0 auto var(--space-xl)',
          color: 'var(--text-inverse)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}>
          <button
            onClick={() => router.push('/records')}
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
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-sm)',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              {(() => {
                const icon = getRiskIcon(safeRiskLevel(diagnosis.riskLevel));
                return React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement<any>, { size: 32, color: '#ffffff' } as any)
                  : icon;
              })()}
            </div>
            <h1 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '700',
              marginBottom: 'var(--space-xs)'
            }}>
              진단 결과
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
          {/* 질병명과 위험도 */}
          <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="card-content">
              <h2 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '700',
                marginBottom: 'var(--space-md)',
                color: 'var(--text-primary)'
              }}>
                {diagnosis.diseaseName || diagnosis.title || '진단명 없음'}
              </h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-xl)',
                background: safeRiskLevel(diagnosis.riskLevel) === 'medium' ? '#fef3c7' :
                  safeRiskLevel(diagnosis.riskLevel) === 'high' ? '#fee2e2' : '#dcfce7',
                color: safeRiskLevel(diagnosis.riskLevel) === 'medium' ? '#92400e' :
                  safeRiskLevel(diagnosis.riskLevel) === 'high' ? '#dc2626' : '#166534',
                fontSize: 'var(--text-sm)',
                fontWeight: '600'
              }}>
                {getRiskIcon(safeRiskLevel(diagnosis.riskLevel))}
                <span>위험도: {getRiskLevelText(safeRiskLevel(diagnosis.riskLevel))}</span>
              </div>
            </div>
          </div>
          {/* 진단 설명 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
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
            <div className="card-header">
              <h3 className="card-title">권장사항</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {(diagnosis.recommendations ?? []).map((recommendation: string, index: number) => (
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
            <span>{formatDateTime(diagnosis.diagnosisDate || diagnosis.date || diagnosis.createdAt || '')}</span>
          </div>
          {/* 안내문구 */}
          <div className="animate-fade-in" style={{
            animationDelay: '0.5s',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-md)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)'
            }}>
              <AlertTriangle size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: 'var(--space-xs)'
                }}>
                  중요한 안내
                </h4>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: '#b45309',
                  lineHeight: '1.5'
                }}>
                  이 진단 결과는 AI 분석을 통한 참고 자료입니다. 
                  정확한 진단과 치료를 위해서는 반드시 피부과 전문의의 진료를 받으시기 바랍니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default RecordDetailPage; 