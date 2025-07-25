'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Info, Share2, Trash2, HelpCircle } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { useDiagnosisStore } from '@/store/diagnosis';
import { formatDateTime } from '@/utils';
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
          title: '피부 진단 결과 공유',
          text: `진단일: ${formatDateTime(diagnosis.diagnosisDate)}\n질병명: ${diagnosis.diseaseName}`,
          url: window.location.href,
        });
      } else {
        const shareText = `피부 진단 결과\n진단일: ${formatDateTime(diagnosis.diagnosisDate)}\n질병명: ${diagnosis.diseaseName}`;
        await navigator.clipboard.writeText(shareText);
        alert('진단 정보가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('공유 중 오류가 발생했습니다.');
    }
  };

  if (!diagnosis) {
    return null;
  }

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

          {/* 질병명 */}
          <div className="card animate-fade-in">
            <div className="card-content" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{diagnosis.diseaseName}</h2>
            </div>
          </div>

          {/* 진단 설명 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}><h3 className="card-title">진단 설명</h3></div>
            <div className="card-content"><p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{diagnosis.description || '만성적이고 재발성을 보이는 염증성 피부질환으로, 가려움증과 특징적인 피부 병변을 동반합니다.'}</p></div>
          </div>

          {/* 상세 정보 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}><h3 className="card-title">상세 정보</h3></div>
            <div className="card-content"><p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{diagnosis.detailedInfo || '아토피 피부염은 전 세계적으로 흔한 만성 염증성 피부질환입니다. 주로 영유아기에 시작되어 소아기, 성인기까지 지속될 수 있습니다. 유전적 소인과 환경적 요인이 복합적으로 작용하여 발생합니다.'}</p></div>
          </div>

          {/* 권장사항 */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="card-header" style={{ background: 'var(--primary-bg)' }}><h3 className="card-title">권장사항</h3></div>
            <div className="card-content">
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {(diagnosis.recommendations && diagnosis.recommendations.length > 0) ? (
                  diagnosis.recommendations.map((rec, index) => <li key={index}>{rec}</li>)
                ) : (
                  <>
                    <li>피부 청결 유지: 순한 클렌저를 사용하여 하루 1-2회 세안하고, 피지와 노폐물을 깨끗이 제거하세요.</li>
                    <li>자극 최소화: 스크럽이나 강한 화학 성분이 포함된 제품 사용을 피하고, 피부를 부드럽게 다루세요.</li>
                    <li>보습 관리: 유분기가 적은 보습제를 사용하여 피부 장벽을 강화하고 건조함을 예방하세요.</li>
                    <li>스트레스 관리: 충분한 수면과 휴식을 통해 스트레스를 관리하고, 건강한 생활 습관을 유지하세요.</li>
                    <li>전문의 상담: 증상이 심하거나 개선되지 않을 경우, 피부과 전문의와 상담하여 적절한 치료를 받으세요.</li>
                  </>
                )}
              </ul>
            </div>
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