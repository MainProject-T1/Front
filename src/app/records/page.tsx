'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useDiagnosisStore } from '@/store/diagnosis';
import { formatDateTime } from '@/utils';

const RecordsPage = () => {
  const router = useRouter();
  const { results } = useDiagnosisStore();
  const userId = localStorage.getItem('userId');
  // userId로 필터링
  const myResults = results.filter(record => record.userId === userId);

  const handleRecordClick = (recordId: string) => {
    router.push(`/records/${recordId}`);
  };

  return (
    <div className="app-container">
      <div className="page-container" style={{ paddingBottom: '100px' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>진료기록</h1>
        {myResults.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>진료기록이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myResults.map(record => (
              <button
                key={record.id}
                onClick={() => handleRecordClick(record.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: 16,
                  borderRadius: 12,
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: 'none',
                  cursor: 'pointer',
                  gap: 8
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 18 }}>{record.diseaseName || record.title || '진단명 없음'}</span>
                <span style={{ color: '#888', fontSize: 14 }}>{record.diagnosisDate || record.date || record.createdAt || ''}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default RecordsPage; 