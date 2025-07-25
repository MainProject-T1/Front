'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Mic, Paperclip, Bot, User, Calendar, MapPin, Clock } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuthStore } from '@/store/auth';

type MessageType = 'text' | 'options' | 'appointment';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: MessageType;
  options?: string[];
  appointmentData?: {
    hospital: string;
    date: string;
    time: string;
    doctor: string;
  };
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  const handleBack = () => {
    router.back();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (overrideMsg?: string) => {
    const userText = overrideMsg ?? inputMessage;
    if (!userText.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    if (!overrideMsg) setInputMessage('');
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userText,
          user_id: user.id // 실제 사용자 ID 전송
        }),
      });

      if (!response.ok) {
        throw new Error('AI 서버와 통신 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text', // 기본 타입을 text로 설정
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : '오류가 발생했습니다.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="app-container">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        paddingBottom: '100px'
      }}>
        
        {/* 헤더 */}
        <div className="header" style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button onClick={handleBack} className="header-back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-sm">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius)',
              background: 'var(--primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                AI 상담사
              </h1>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)'
              }}>
                온라인
              </p>
            </div>
          </div>
          <div style={{ width: '44px' }}></div>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          padding: 'var(--space-md)',
          overflow: 'auto',
          background: 'var(--bg-secondary)'
        }} className="scroll-container">
          <div className="flex flex-col gap-md">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`flex items-end gap-xs max-w-[85%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* 아바타 */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background:
                        message.sender === 'user' ? 'var(--primary)' : 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {message.sender === 'user' ? (
                      <User size={16} color="var(--text-inverse)" />
                    ) : (
                      <Bot size={16} color="var(--primary)" />
                    )}
                  </div>

                  {/* 메시지 버블 */}
                  <div>
                    <div
                      style={{
                        background:
                          message.sender === 'user'
                            ? 'var(--primary)'
                            : 'var(--bg-primary)',
                        color:
                          message.sender === 'user'
                            ? 'var(--text-inverse)'
                            : 'var(--text-primary)',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        lineHeight: '1.5',
                        boxShadow: 'var(--shadow-sm)',
                        marginBottom: '4px'
                      }}
                    >
                      {message.content}
                    </div>

                    {/* 옵션 버튼들 */}
                    {message.type === 'options' && message.options && (
                      <div style={{ marginTop: 'var(--space-sm)' }}>
                        <div className="flex flex-col gap-xs">
                          {message.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(option)}
                              style={{
                                padding: 'var(--space-sm) var(--space-md)',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--space-sm)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary-bg)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-primary)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 예약 정보 카드 */}
                    {message.type === 'appointment' && message.appointmentData && (
                      <div style={{ marginTop: 'var(--space-sm)' }}>
                        <div className="card">
                          <div className="card-content" style={{ padding: 'var(--space-md)' }}>
                            <h4
                              style={{
                                fontSize: 'var(--text-lg)',
                                fontWeight: '600',
                                marginBottom: 'var(--space-md)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              📅 예약 확정
                            </h4>

                            <div className="flex items-center gap-sm mb-sm">
                              <MapPin size={16} color="var(--text-secondary)" />
                              <span style={{ fontSize: 'var(--text-base)' }}>
                                {message.appointmentData.hospital}
                              </span>
                            </div>

                            <div className="flex items-center gap-sm mb-sm">
                              <Calendar size={16} color="var(--text-secondary)" />
                              <span style={{ fontSize: 'var(--text-base)' }}>
                                {message.appointmentData.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-sm mb-md">
                              <Clock size={16} color="var(--text-secondary)" />
                              <span style={{ fontSize: 'var(--text-base)' }}>
                                {message.appointmentData.time}
                              </span>
                            </div>

                            <div
                              style={{
                                background: 'var(--primary-bg)',
                                padding: 'var(--space-sm)',
                                borderRadius: 'var(--space-sm)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--primary)'
                              }}
                            >
                              담당의: {message.appointmentData.doctor}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 시간 */}
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        textAlign: message.sender === 'user' ? 'right' : 'left'
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', padding: 'var(--space-sm) var(--space-md)' }}>
                <Bot size={24} style={{ color: 'var(--primary)' }} />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 입력 영역 */}
        <div style={{
          padding: 'var(--space-md)',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border)'
        }}>
          <div className="flex items-end gap-sm">
            
            {/* 첨부 버튼 */}
            <button style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-secondary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}>
              <Paperclip size={20} />
            </button>

            {/* 입력 필드 */}
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isLoading ? "AI가 답변을 준비 중입니다..." : "메시지를 입력하세요..."}
                disabled={isLoading} // 로딩 중 비활성화
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: 'var(--space-sm) var(--space-md)',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'inherit',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  resize: 'none',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* 음성/전송 버튼 */}
            {inputMessage.trim() && !isLoading ? (
              <button
                onClick={() => handleSendMessage()}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--primary)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-inverse)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <Send size={20} />
              </button>
            ) : (
              <button style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius)',
                background: isLoading ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)'
              }} disabled={isLoading}>
                <Mic size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 바텀 네비게이션 */}
      <BottomNavigation />

      {/* 타이핑 애니메이션 스타일 */}
      <style jsx>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--text-tertiary);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;