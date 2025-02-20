import { useState } from 'react';

function NotificationPopover({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div 
        style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '360px',
          maxHeight: '480px',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          marginTop: '0.5rem',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white'
          }}>
            알림
          </h3>
        </div>
        <div style={{
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {/* 임시 알림 목록 */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #374151'
          }}>
            <p style={{ color: 'white', marginBottom: '0.5rem' }}>
              새로운 스터디가 등록되었습니다.
            </p>
            <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
              방금 전
            </span>
          </div>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #374151'
          }}>
            <p style={{ color: 'white', marginBottom: '0.5rem' }}>
              알고리즘 스터디 모집이 마감되었습니다.
            </p>
            <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
              1시간 전
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationPopover; 