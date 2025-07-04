import React, { useState, useRef, useEffect } from "react";
// import LoadingScreen from "./components/LoadingScreen";
import { FirstScreen } from "./components/FirstScreen";
import HomeScreen from "./components/HomeScreen";
import CameraScreen from "./components/CameraScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import DiagnosisResultScreen from "./components/DiagnosisResultScreen";
import LogFirst from "./components/LogFirst";
import LogIn from "./components/LogIn";
import LogSignUp from "./components/LogSignUp";

export default function App() {
  // 로그인/온보딩/홈 상태 관리
  const [appStep, setAppStep] = useState("loading"); // loading | logFirst | logIn | logSignUp | home
  const [currentScreen, setCurrentScreen] = useState("home"); // 'home' | 'camera'
  const [showDiagnosisResult, setShowDiagnosisResult] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false); // 오버레이 표시 여부
  const [overlayOpacity, setOverlayOpacity] = useState(0); // 오버레이 투명도
  const [shouldRenderCamera, setShouldRenderCamera] = useState(false); // 카메라 렌더링 여부
  const dummyRecords = [
    {
      img: "/images/record1.jpeg",
      title: "악성 흑색종",
      date: "2025. 06. 23.",
    },
    {
      img: "/images/record2.jpeg",
      title: "악성 흑색종",
      date: "2025. 06. 21.",
    },
  ];
  const [records, setRecords] = useState(dummyRecords);

  const user = {
    name: "강종우",
    profileImg: "/images/profile.png",
  };

  // 인트로(로딩) → 3초 후 logFirst
  useEffect(() => {
    if (appStep === "loading") {
      const timer = setTimeout(() => setAppStep("logFirst"), 3000);
      return () => clearTimeout(timer);
    }
  }, [appStep]);

  // 진단 버튼 클릭 시: 오버레이 fade-in(1초), fade-in 끝나면 카메라 렌더
  const handleDiagnose = () => {
    setShowOverlay(true);
    setOverlayOpacity(0);
    setShouldRenderCamera(false);
    setTimeout(() => {
      setOverlayOpacity(1); // 1초 fade-in
      setTimeout(() => {
        setShouldRenderCamera(true); // fade-in 끝나면 카메라 렌더
        setCurrentScreen("camera");
      }, 1000);
    }, 10);
  };

  // 카메라에서 로딩 완료 시: 오버레이 fade-out(1초) 후 제거
  const handleCameraReady = () => {
    setOverlayOpacity(0); // 1초 fade-out
    setTimeout(() => setShowOverlay(false), 1000); // 1초 후 오버레이 제거
  };

  // 카메라에서 진단 완료 시: 진단결과 팝업 띄우기
  const handleCameraDiagnosisComplete = (diagnosis, image) => {
    setDiagnosisResult(diagnosis);
    setCapturedImage(image);
    setShowDiagnosisResult(true);
    setCurrentScreen("home");
  };

  // 카메라에서 뒤로가기(←) 버튼 클릭 시 홈으로 이동
  const handleCameraBack = () => {
    setCurrentScreen("home");
  };

  // 진단결과 X: 팝업 닫고 카메라로 이동
  const handleCloseDiagnosis = () => {
    setShowDiagnosisResult(false);
    setCurrentScreen("camera");
  };

  // 진단결과 확인: 기록 추가 + 팝업 닫기
  const handleConfirmDiagnosis = () => {
    if (diagnosisResult && capturedImage) {
      setRecords(prev => [
        {
          img: capturedImage,
          title: diagnosisResult.diagnosis,
          date: diagnosisResult.diagnosisDate ? new Date(diagnosisResult.diagnosisDate).toLocaleDateString('ko-KR') : '-',
        },
        ...prev
      ]);
    }
    setShowDiagnosisResult(false);
  };

  // 로그인/온보딩/홈 플로우 렌더링
  const renderAppStep = () => {
    if (appStep === "loading") {
      // 오직 FirstScreen(SVG 3종)만 노출 (텍스트/스피너 등 추가 X)
      return <FirstScreen onComplete={() => setAppStep("logFirst")} />;
    }
    if (appStep === "logFirst") {
      return <LogFirst onLogin={() => setAppStep("logIn")} onSignUp={() => setAppStep("logSignUp")} />;
    }
    if (appStep === "logIn") {
      return <LogIn onGoHome={() => setAppStep("home")} />;
    }
    if (appStep === "logSignUp") {
      return <LogSignUp onGoLogin={() => setAppStep("logIn")} />;
    }
    // appStep === 'home' 이후 기존 진단/홈 플로우
    if (shouldRenderCamera && currentScreen === "camera") {
      return <CameraScreen onDiagnosisComplete={handleCameraDiagnosisComplete} onBack={handleCameraBack} onCameraReady={handleCameraReady} />;
    }
    return <HomeScreen records={records} setRecords={setRecords} user={user} onDiagnose={handleDiagnose} />;
  };

  return (
    <div id="app-container" className="w-[360px] h-[800px] bg-white shadow-2xl mx-auto my-4 relative rounded-3xl overflow-hidden">
      {renderAppStep()}
      {showDiagnosisResult && (
        <div className="absolute inset-0 z-50">
          <DiagnosisResultScreen
            diagnosis={diagnosisResult}
            capturedImage={capturedImage}
            onClose={handleCloseDiagnosis}
            onConfirm={handleConfirmDiagnosis}
          />
        </div>
      )}
      {showOverlay && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000"
          style={{
            background: '#2260FF',
            opacity: overlayOpacity,
            pointerEvents: 'auto',
          }}
        >
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin mb-4"></div>
          <p className="mt-2 text-white text-lg font-bold">Skancer! 로딩중...</p>
        </div>
      )}
    </div>
  );
}