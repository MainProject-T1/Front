import React, { useState } from 'react';

function LogIn({ onGoHome }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#888888]" style={{ minHeight: '100vh' }}>
      <div style={{ width: 360, height: 800, borderRadius: 30, background: 'white', position: 'relative', boxShadow: '0 0 0 0' }}>
        {/* SVG 전체 하드코딩 */}
        {/* ...SVG 코드 생략(실제 구현 시 전체 SVG 삽입)... */}
        {/* 입력폼/버튼 하드코딩 (SVG와 겹치지 않게 절대 위치) */}
        <div style={{ position: 'absolute', top: 200, left: 0, width: '100%', padding: '0 30px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#070707', marginBottom: 8 }}>이메일</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@example.com"
              style={{ width: '100%', height: 45, borderRadius: 13, background: '#ECF1FF', border: 'none', padding: '0 16px', fontSize: 16, color: '#A3A3A3' }}
              autoComplete="username"
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#070707', marginBottom: 8 }}>비밀번호</div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="**************"
                style={{ width: '100%', height: 45, borderRadius: 13, background: '#ECF1FF', border: 'none', padding: '0 40px 0 16px', fontSize: 16, color: '#A3A3A3' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label="비밀번호 보기"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {/* 눈 아이콘 SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#070707" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="#070707" strokeWidth="1.5"/></svg>
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <a href="#" style={{ fontSize: 12, color: '#2260FF', textDecoration: 'none' }}>Password를 잊으셨나요?</a>
            </div>
          </div>
          <button
            style={{ width: '100%', height: 45, borderRadius: 22.5, background: '#2260FF', color: 'white', fontSize: 20, fontWeight: 500, margin: '24px 0 0 0', border: 'none', cursor: 'pointer' }}
            onClick={() => {}}
          >
            로그인!
          </button>
          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#070707' }}>
            계정이 없으신가요?{' '}
            <button
              style={{ color: '#2260FF', background: 'none', border: 'none', padding: 0, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={onGoHome}
            >
              계정생성!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogIn; 