'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Info, Share2, Trash2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { useDiagnosisStore } from '@/store/diagnosis';
import { formatDateTime, getRiskLevelText } from '@/utils';
import type { DiagnosisResult } from '@/types';

const RecordDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const results = useDiagnosisStore(state => state.results);
  const deleteDiagnosisResult = useDiagnosisStore(state => state.deleteDiagnosisResult);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const foundDiagnosis = results.find(result => result.id === id);
    
    if (foundDiagnosis) {
      setDiagnosis(foundDiagnosis);
    } else {
      router.push('/records');
    }
  }, [params.id, results, router]);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    if (!diagnosis) return;

    deleteDiagnosisResult(diagnosis.id);

    setShowDeleteModal(false);

    router.replace('/records');
  };

  const handleShare = async () => {
    if (!diagnosis) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `피부 진단 결과 - ${diagnosis.diseaseName}`,
          text: `진단일: ${formatDateTime(diagnosis.diagnosisDate)}\n질병명: ${diagnosis.diseaseName}\n위험도: ${getRiskLevelText(diagnosis.riskLevel)}`,
        });
      } else {
        // 공유 API가 지원되지 않는 경우 클립보드에 복사
        const shareText = `피부 진단 결과\n진단일: ${formatDateTime(diagnosis.diagnosisDate)}\n질병명: ${diagnosis.diseaseName}\n위험도: ${getRiskLevelText(diagnosis.riskLevel)}`;
        await navigator.clipboard.writeText(shareText);
        alert('진단 결과가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('공유 중 오류가 발생했습니다.');
    }
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

  if (!diagnosis) {
    return null;
  }

  const badgeBg =
    diagnosis.riskLevel === 'medium'
      ? '#fef3c7'
      : diagnosis.riskLevel === 'high'
      ? '#fee2e2'
      : '#dcfce7';

  const badgeColor =
    diagnosis.riskLevel === 'medium'
      ? '#92400e'
      : diagnosis.riskLevel === 'high'
      ? '#dc2626'
      : '#166534';

  return (
    <div className="app-container">
      <div className="page-container" style={{ paddingBottom: '100px' }}>
        {/* safe-area */}
        <div style={{ height: 'max(20px, env(safe-area-inset-top))' }} />

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
          <button onClick={handleBack} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>진료기록 상세</h1>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button onClick={handleShare} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)' }}>
              <Share2 size={20} />
            </button>
            <button onClick={() => setShowDeleteModal(true)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', transition: 'var(--transition)' }}>
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', overflowY: 'auto', flex: 1 }}>
          {/* 진단 이미지 */}
          <div className="card animate-scale-in">
            <div style={{ width: '100%', height: '200px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              <img src={diagnosis.image} alt="진단 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* 질병명 & 위험도 */}
          <div className="card animate-fade-in">
            <div className="card-content" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{diagnosis.diseaseName}</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-xl)', background: badgeBg, color: badgeColor, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {getRiskIcon(diagnosis.riskLevel)}
                <span>위험도: {getRiskLevelText(diagnosis.riskLevel)}</span>
              </div>
            </div>
          </div>

          {/* 진단 설명 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}><h3 className="card-title">진단 설명</h3></div>
            <div className="card-content"><p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{diagnosis.description}</p></div>
          </div>

          {/* 상세 정보 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}><h3 className="card-title">상세 정보</h3></div>
            <div className="card-content"><p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{diagnosis.detailedInfo}</p></div>
          </div>

          {/* 권장사항 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}><h3 className="card-title">권장사항</h3></div>
            <div className="card-content"><div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>{diagnosis.recommendations.map((rec, idx) => (<div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}><div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div><p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</p></div>))}</div></div>
          </div>

          {/* 진단 날짜 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            <Calendar size={16} />
            <span>{formatDateTime(diagnosis.diagnosisDate)}</span>
          </div>

          {/* 액션 버튼들 */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingTop: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <button className="btn btn-secondary" onClick={() => router.push('/chat')}>상담하기</button>
              <button className="btn btn-secondary" onClick={() => router.push('/diagnosis')}>재진단</button>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 'var(--radius)', padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
              <AlertTriangle size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#92400e', marginBottom: 'var(--space-xs)' }}>의료진 상담 권장</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: '#b45309', lineHeight: 1.5 }}>이 진단 결과는 AI 분석을 통한 참고 자료입니다. 정확한 진단과 치료를 위해서는 반드시 피부과 전문의의 진료를 받으시기 바랍니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 바텀 네비게이션 */}
      <BottomNavigation />
      {/* 삭제 확인 모달 */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="진료기록 삭제" size="sm">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={24} color="#ef4444" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}><strong>{diagnosis.diseaseName}</strong> 진료기록을 삭제하시겠습니까?</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>삭제된 기록은 복구할 수 없습니다.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button variant="outline" size="md" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>취소</Button>
            <Button variant="danger" size="md" style={{ flex: 1 }} onClick={handleDelete}>삭제</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecordDetailPage; 