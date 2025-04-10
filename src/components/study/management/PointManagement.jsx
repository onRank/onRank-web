import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { managementService } from '../../../services/management';

function PointManagement() {
  const { studyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pointData, setPointData] = useState({
    totalPoint: 0,
    prize: 0,
    members: []
  });

  // 포인트 데이터 조회
  useEffect(() => {
    const fetchPointData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await managementService.getPointInfo(studyId);
        setPointData(response.data || {
          totalPoint: 0,
          prize: 0,
          members: []
        });
      } catch (err) {
        console.error('포인트 정보 조회 실패:', err);
        setError('포인트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPointData();
  }, [studyId]);

  // 포인트 랭킹 테이블
  const renderPointRanking = () => {
    if (!pointData.members || pointData.members.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
          회원 정보가 없습니다.
        </div>
      );
    }

    // 포인트 기준으로 내림차순 정렬
    const sortedMembers = [...pointData.members].sort((a, b) => b.point - a.point);
    
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>순위</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>이름</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>포인트</th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>출석</th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>결석</th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>지각</th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((member, index) => (
            <tr 
              key={member.id} 
              style={{ 
                borderBottom: '1px solid #E5E5E5',
                backgroundColor: index < 3 ? '#f9fbe7' : 'transparent'
              }}
            >
              <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                {index + 1}
              </td>
              <td style={{ padding: '0.75rem' }}>
                {member.name}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                {member.point} 점
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {member.presentCount || 0}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {member.absentCount || 0}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {member.lateCount || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>포인트 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>포인트 관리</h3>
      
      {error && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.5rem 1rem', 
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      {/* 포인트 요약 카드 */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          flex: '1 1 45%',
          minWidth: '200px',
          padding: '1.5rem',
          backgroundColor: '#f5f9f9',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#555' }}>총 포인트</h4>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span role="img" aria-label="포인트">💰</span>
            <span>{pointData.totalPoint || 0} 점</span>
          </div>
        </div>
        
        <div style={{ 
          flex: '1 1 45%',
          minWidth: '200px',
          padding: '1.5rem',
          backgroundColor: '#fffde7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#555' }}>현재 상금</h4>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span role="img" aria-label="상금">💵</span>
            <span>{new Intl.NumberFormat('ko-KR').format(pointData.prize || 0)} 원</span>
          </div>
        </div>
      </div>
      
      {/* 포인트 랭킹 */}
      <div>
        <h4 style={{ marginBottom: '1rem' }}>포인트 랭킹</h4>
        {renderPointRanking()}
      </div>
    </div>
  );
}

PointManagement.propTypes = {
  // PropTypes 정의
};

export default PointManagement; 