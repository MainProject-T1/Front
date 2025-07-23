'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Image, RotateCcw } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useDiagnosisStore } from '@/store/diagnosis';
import { analyzeImageAndSave } from '@/services/diagnosis';
import { saveDiagnosisRecord } from '@/services/diagnosis';

const DiagnosisPage = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { setCurrentDiagnosis, results, setResults } = useDiagnosisStore.getState();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      // 카메라 접근 실패 시 기본 화면 표시
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleBack = () => {
    stopCamera();
    router.back();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  // 파일 선택 시
  const selectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
          stopCamera();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);

    try {
      if (!selectedFile) {
        alert('이미지를 선택하세요.');
        return;
      }
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('로그인이 필요합니다.');
        return;
      }
      const aiResult = await analyzeImageAndSave(selectedFile, userId);

      // addDiagnosisResult 는 id 를 다시 생성하므로 기존 id 제거
      const { id: _ignoredId, ...resultWithoutId } = aiResult as any;

      // 기존: const { addDiagnosisResult } = useDiagnosisStore.getState();
      // await addDiagnosisResult(resultWithoutId, 'user_123');
      // → FastAPI로만 저장하도록 변경, 상태 반영은 필요시 직접 setCurrentDiagnosis 등 사용

      // addDiagnosisResult 실행 직후 첫 번째 요소가 가장 최신
      // const newId = useDiagnosisStore.getState().results[0]?.id;
      // if (newId) {
      //   router.push(`/diagnosis/result/${newId}`);
      // }
      // 필요하다면 analyzeImageAndSave로 FastAPI에 저장 후 결과를 받아서 상태에 반영
    } catch (err) {
      console.error(err);
      alert('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !capturedImage) {
      alert('이미지를 선택하세요.');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    setIsAnalyzing(true);
    try {
      // 1. AI 진단 결과 받기
      const result = await analyzeImageAndSave(selectedFile, userId);

      // 2. DB에 진단 결과 저장
      await saveDiagnosisRecord({
        userId,
        title: result.diseaseName || result.title || 'AI 진단',
        date: result.diagnosisDate || new Date().toISOString(),
        diagnosis: result.diseaseName || result.diagnosis || ''
      });

      // 3. 프론트 상태에도 결과 저장
      const resultWithId = {
        ...result,
        id: result.id || Date.now().toString(),
        userId,
        image: capturedImage
      };
      setCurrentDiagnosis(resultWithId);
      setResults([resultWithId, ...results]);

      // 4. 결과 페이지로 이동
      router.push(`/diagnosis/result/${resultWithId.id}`);
    } catch (err) {
      alert('AI 분석 또는 DB 저장 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        background: '#000000',
        paddingBottom: '100px'
      }}>
        
        {/* 상단 컨트롤 */}
        <div style={{
          position: 'absolute',
          top: 'max(20px, env(safe-area-inset-top))',
          left: 0,
          right: 0,
          zIndex: 20,
          padding: 'var(--space-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handleBack}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <ArrowLeft size={24} />
          </button>

          {capturedImage && (
            <button
              onClick={retakePhoto}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <RotateCcw size={20} />
            </button>
          )}
        </div>

        {/* 카메라/이미지 영역 */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {capturedImage ? (
            // 캡처된 이미지 표시
            <img
              src={capturedImage}
              alt="촬영된 이미지"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            // 카메라 피드
            <>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                playsInline
                muted
              />
              
              {/* 촬영 가이드 */}
              {isCameraReady && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '280px',
                  height: '280px',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 'var(--radius-xl)',
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: 'var(--text-sm)',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--space-sm)'
                  }}>
                    피부 부위를 가이드 안에 맞춰주세요
                  </div>
                </div>
              )}

              {!isCameraReady && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#ffffff'
                }}>
                  <Camera size={48} style={{ marginBottom: 'var(--space-md)' }} />
                  <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>
                    카메라 준비 중...
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>
                    카메라 권한을 허용해주세요
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단 컨트롤 */}
        <div style={{
          position: 'absolute',
          bottom: 'max(120px, calc(100px + env(safe-area-inset-bottom)))',
          left: 0,
          right: 0,
          padding: 'var(--space-xl)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--space-xl)',
          zIndex: 10
        }}>

          {capturedImage ? (
            // 이미지 캡처 후 버튼들
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                padding: 'var(--space-md) var(--space-xl)',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                color: '#ffffff',
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}
            >
              {isAnalyzing ? (
                <>
                  <div className="loading-spinner" />
                  AI 분석 중...
                </>
              ) : (
                'AI 진단 시작'
              )}
            </button>
          ) : (
            // 카메라 화면 버튼들
            <>
              {/* 갤러리 버튼 */}
              <button
                onClick={selectFromGallery}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <Image size={24} color="#000000" />
              </button>

              {/* 셔터 버튼 */}
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isCameraReady ? 'pointer' : 'not-allowed',
                  transition: 'var(--transition)',
                  opacity: isCameraReady ? 1 : 0.5
                }}
              >
                <Camera size={32} color="#000000" />
              </button>

              {/* 오른쪽 여백 (대칭을 위해) */}
              <div style={{ width: '50px' }}></div>
            </>
          )}
        </div>

        {/* 숨겨진 캔버스 */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* 바텀 네비게이션 */}
      <BottomNavigation />
    </div>
  );
};

export default DiagnosisPage; 