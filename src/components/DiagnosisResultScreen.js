import React from 'react';
import DiagnosisResult from './DiagnosisResult';

export default function DiagnosisResultScreen({ diagnosis, capturedImage, onClose, onConfirm }) {
  return (
    <div className="w-[360px] h-[800px] bg-[#F5F6FA] flex items-stretch justify-center mx-auto my-0">
      <DiagnosisResult diagnosis={diagnosis} capturedImage={capturedImage} onClose={onClose} onConfirm={onConfirm} />
    </div>
  );
} 