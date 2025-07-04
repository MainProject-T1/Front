import React, { useState } from 'react';

export default function LogSignUp({ onGoLogin }) {
  // 비밀번호 보기/숨기기 상태
  const [showPw, setShowPw] = useState(false);
  // 입력값 상태
  const [form, setForm] = useState({
    name: '',
    password: '',
    email: '',
    phone: '',
    birth: '',
  });

  // 입력 핸들러
  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // 입력박스 zIndex 동적 제어 함수
  const getInputZ = (value) => (value ? 11 : 9);
  // 입력박스 배경색 동적 제어 함수 (SVG 네모박스와 동일한 색상)
  const getInputBg = (value) => (value ? '#ECF1FF' : 'transparent');

  // 네모박스 기준: x=30, y=139, w=299, h=45 → input: x=38, y=147, w=283, h=29
  // 눈 아이콘 SVG는 public/images/log_signup.svg에서 <g transform=...> 부분에 새 SVG로 교체 필요

  return (
    <div className="relative w-[360px] h-[800px] mx-auto">
      {/* 전체 SVG 배경 */}
      <img
        src="/images/log_signup.svg"
        alt="회원가입"
        className="absolute top-0 left-0 w-full h-full select-none pointer-events-none"
        draggable={false}
      />
      {/* 이름 입력박스 (x=38, y=147, w=283, h=29) */}
      <input
        type="text"
        value={form.name}
        onChange={handleChange('name')}
        className="absolute outline-none text-black px-4"
        style={{
          left: 38,
          top: 147,
          width: 283,
          height: 29,
          zIndex: getInputZ(form.name),
          background: getInputBg(form.name),
        }}
        aria-label="이름"
      />
      {/* 비밀번호 입력박스 (x=38, y=236, w=283, h=29) */}
      <input
        type={showPw ? 'text' : 'password'}
        value={form.password}
        onChange={handleChange('password')}
        className="absolute outline-none text-black px-4 pr-10"
        style={{
          left: 38,
          top: 236,
          width: 275,
          height: 25,
          zIndex: getInputZ(form.password),
          background: form.password ? '#ECF1FF' : 'transparent',
          border: 'none',
          outline: 'none',
        }}
        aria-label="비밀번호"
      />
      {/* 눈 아이콘 클릭 영역 (투명 버튼) */}
      <button
        style={{
          position: 'absolute',
          left: 236,
          top: 241,
          width: 22,
          height: 18,
          zIndex: 9999,
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
        }}
        onClick={() => setShowPw((v) => !v)}
        aria-label="비밀번호 보기/숨기기"
      />
      {/* 이메일 입력박스 (x=38, y=325, w=283, h=29) */}
      <input
        type="email"
        value={form.email}
        onChange={handleChange('email')}
        className="absolute outline-none text-black px-4"
        style={{
          left: 38,
          top: 325,
          width: 283,
          height: 29,
          zIndex: getInputZ(form.email),
          background: getInputBg(form.email),
        }}
        aria-label="이메일"
      />
      {/* 전화번호 입력박스 (x=38, y=414, w=283, h=29) */}
      <input
        type="tel"
        value={form.phone}
        onChange={handleChange('phone')}
        className="absolute outline-none text-black px-4"
        style={{
          left: 38,
          top: 414,
          width: 283,
          height: 29,
          zIndex: getInputZ(form.phone),
          background: getInputBg(form.phone),
        }}
        aria-label="전화번호"
      />
      {/* 생년월일 입력박스 (x=38, y=502, w=283, h=29) */}
      <input
        type="text"
        value={form.birth}
        onChange={handleChange('birth')}
        className="absolute outline-none text-black px-4"
        style={{
          left: 38,
          top: 502,
          width: 283,
          height: 29,
          zIndex: getInputZ(form.birth),
          background: getInputBg(form.birth),
        }}
        aria-label="생년월일"
      />
      {/* 계정 생성! 버튼 (x=76, y=591, w=207, h=45) */}
      <button
        type="button"
        onClick={onGoLogin}
        className="absolute bg-transparent cursor-pointer"
        style={{
          left: 76,
          top: 591,
          width: 207,
          height: 45,
          zIndex: 20,
        }}
        aria-label="계정 생성!"
        tabIndex={0}
      />
    </div>
  );
} 