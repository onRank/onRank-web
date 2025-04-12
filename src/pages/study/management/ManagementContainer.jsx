import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StudyManagement from '../../../components/study/management/StudyManagement';
import MemberManagement from '../../../components/study/management/MemberManagement';
import PointManagement from '../../../components/study/management/PointManagement';

function ManagementContainer() {
  const { studyId } = useParams();
  const [activeTab, setActiveTab] = useState('study'); // 'study', 'member', 'point'

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          스터디 관리
        </h2>
      </div>
      
      {/* 관리 탭 메뉴 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('study')}
            style={{
              backgroundColor: activeTab === 'study' ? '#000000' : '#FFFFFF',
              color: activeTab === 'study' ? 'white' : '#000',
              border: activeTab === 'study' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            스터디
          </button>
          <button 
            onClick={() => setActiveTab('member')}
            style={{
              backgroundColor: activeTab === 'member' ? '#000000' : '#FFFFFF',
              color: activeTab === 'member' ? 'white' : '#000',
              border: activeTab === 'member' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            회원
          </button>
          <button 
            onClick={() => setActiveTab('point')}
            style={{
              backgroundColor: activeTab === 'point' ? '#000000' : '#FFFFFF',
              color: activeTab === 'point' ? 'white' : '#000',
              border: activeTab === 'point' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            포인트
          </button>
        </div>
      </div>
      
      {/* 현재 선택된 탭에 따라 컴포넌트 렌더링 */}
      <div>
        {activeTab === 'study' && <StudyManagement />}
        {activeTab === 'member' && <MemberManagement />}
        {activeTab === 'point' && <PointManagement />}
      </div>
    </div>
  );
}

export default ManagementContainer; 