import React, { useState } from "react";
// import LoadingScreen from "./components/LoadingScreen";
import { FirstScreen } from "./components/FirstScreen";
import HomeScreen from "./components/HomeScreen";
import CameraScreen from "./components/CameraScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import DiagnosisResultScreen from "./components/DiagnosisResultScreen";

export default function App() {
  const [showFirstScreen, setShowFirstScreen] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("home"); // 'home' | 'camera'
  const [showDiagnosisResult, setShowDiagnosisResult] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
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

  // 온보딩 완료
  const handleFirstScreenComplete = () => {
    setShowFirstScreen(false);
  };

  // 진단 버튼 클릭 시 카메라로 이동
  const handleDiagnose = () => {
    setCurrentScreen("camera");
  };

  // 카메라에서 진단 완료 시: 진단결과 팝업만 띄움
  const handleCameraDiagnosisComplete = (diagnosis, image) => {
    console.log('handleCameraDiagnosisComplete 호출:', { diagnosis, image });
    setDiagnosisResult(diagnosis);
    setCapturedImage(image);
    setShowDiagnosisResult(true);
  };

  // 진단결과 X: 팝업 닫고 카메라로 (진료기록 추가 없음)
  const handleCloseDiagnosis = () => {
    setShowDiagnosisResult(false);
    setCurrentScreen("camera");
  };

  // 진단결과 확인: 기록 추가 + 팝업 닫고 홈으로
  const handleConfirmDiagnosis = () => {
    console.log('handleConfirmDiagnosis 진단결과:', { diagnosisResult, capturedImage });
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
    setCurrentScreen("home");
  };

  if (showFirstScreen) {
    return (
      <div id="app-container" className="w-[360px] h-[800px] bg-white shadow-2xl mx-auto my-4 relative rounded-3xl overflow-hidden">
        <FirstScreen onComplete={handleFirstScreenComplete} />
      </div>
    );
  }

  return (
    <div id="app-container" className="w-[360px] h-[800px] bg-white shadow-2xl mx-auto my-4 relative rounded-3xl overflow-hidden">
      {currentScreen === "home" && (
        <HomeScreen records={records} setRecords={setRecords} user={user} onDiagnose={handleDiagnose} />
      )}
      {currentScreen === "camera" && (
        <CameraScreen onDiagnosisComplete={handleCameraDiagnosisComplete} />
      )}
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
    </div>
  );
}