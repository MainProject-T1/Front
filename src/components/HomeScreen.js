import React from 'react';
import Header from './Header';
import DiagnosisButton from './DiagnosisButton';
import Calendar from './Calendar';
import ScheduleCard from './ScheduleCard';
import MedicalRecordList from './MedicalRecordList';
import BottomNav from './BottomNav';

export default function HomeScreen({ records, setRecords, user, onDiagnose }) {
  const schedule = [
    {
      time: "10 AM",
      title: "진료 예약",
      desc: "흑색종 의심으로 인한 진료 예약",
      date: "2025. 06. 25",
    },
  ];

  return (
    <div id="app-container" className="w-[360px] h-[800px] bg-white flex flex-col shadow-2xl mx-auto my-4 relative">
      <Header user={user} />
      <div className="flex-grow flex flex-col items-center px-4 pb-20 overflow-y-auto">
        <DiagnosisButton onDiagnose={onDiagnose} />
        <Calendar />
        <ScheduleCard schedule={schedule} />
        <MedicalRecordList records={records} />
      </div>
      <BottomNav />
    </div>
  );
}