import React from 'react';

export default function LogFirst({ onLogin, onSignUp }) {
  return (
    <div className="relative w-[360px] h-[800px] mx-auto">
      {/* 전체 SVG 배경 */}
      <img
        src="/images/log_first.svg"
        alt="로그인/회원가입"
        className="absolute top-0 left-0 w-full h-full select-none pointer-events-none"
        draggable={false}
      />
      {/* 로그인! 투명 버튼 */}
      <button
        onClick={onLogin}
        className="absolute"
        style={{
          left: 82,
          top: 636,
          width: 207,
          height: 45,
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="로그인!"
        tabIndex={0}
      />
      {/* 계정 생성! 투명 버튼 */}
      <button
        onClick={onSignUp}
        className="absolute"
        style={{
          left: 82,
          top: 688,
          width: 207,
          height: 45,
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="계정 생성!"
        tabIndex={0}
      />
    </div>
  );
} 