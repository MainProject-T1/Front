// 진단 기록 저장 (FastAPI)
export async function analyzeImageAndSave(file: File, userId: string) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('userId', userId);

  const res = await fetch('http://localhost:3002/api/diagnose', {
    method: 'POST',
    body: formData,
    // 'Content-Type'은 FormData 사용 시 자동 설정됨
  });
  const data = await res.json();
  return data.result;
}

// 진단 결과 DB 저장 함수
export async function saveDiagnosisRecord({
  userId,
  title,
  date,
  diagnosis
}: {
  userId: string;
  title: string;
  date: string;
  diagnosis: string;
}) {
  const res = await fetch('http://localhost:3002/api/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, date, diagnosis })
  });
  if (!res.ok) throw new Error('진단 기록 저장 실패');
  return await res.json();
} 