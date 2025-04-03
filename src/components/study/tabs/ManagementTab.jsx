import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { studyService } from '../../../services/api';
import MemberManagement from './management/MemberManagement';
import StudyManagement from './management/StudyManagement';
import PointManagement from './management/PointManagement';

function ManagementTab({ studyData }) {
  const { studyId } = useParams();
  const [managementTab, setManagementTab] = useState('스터디'); // 관리 탭 내부 탭 (회원, 스터디, 포인트)
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 회원 목록 가져오기
  useEffect(() => {
    if (managementTab === '회원') {
      fetchMembers();
    }
  }, [managementTab, studyId]);

  // 회원 목록 API 호출 함수
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // studyService를 사용하여 멤버 목록 조회
      const response = await studyService.getStudyMembers(studyId);
      console.log('회원 목록 조회 결과:', response);
      
      // 응답이 배열이 아닌 경우 members 필드로 접근 (API 명세 변경 가능성에 대비)
      const membersList = Array.isArray(response) ? response : response.members || [];
      setMembers(membersList);
    } catch (err) {
      console.error('회원 목록 조회 오류:', err);
      setError('회원 목록을 불러오는데 실패했습니다.');
      // 개발 중에는 임시 데이터 사용 (CREATOR 역할 포함)
      setMembers([
        { memberId: 1, studentName: '회원1 (생성자)', studentEmail: 'creator@example.com', memberRole: 'CREATOR', studyName: '테스트 스터디' },
        { memberId: 2, studentName: '회원2 (관리자)', studentEmail: 'host@example.com', memberRole: 'HOST' },
        { memberId: 3, studentName: '회원3', studentEmail: 'member1@example.com', memberRole: 'PARTICIPANT' },
        { memberId: 4, studentName: '회원4', studentEmail: 'member2@example.com', memberRole: 'PARTICIPANT' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1.5rem',
        color: '#333'
      }}>
        스터디 관리
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setManagementTab('스터디')}
            style={{
              backgroundColor: managementTab === '스터디' ? '#000000' : '#FFFFFF',
              color: managementTab === '스터디' ? 'white' : '#000',
              border: managementTab === '스터디' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            스터디
          </button>
          <button 
            onClick={() => setManagementTab('회원')}
            style={{
              backgroundColor: managementTab === '회원' ? '#000000' : '#FFFFFF',
              color: managementTab === '회원' ? 'white' : '#000',
              border: managementTab === '회원' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            회원
          </button>
          <button 
            onClick={() => setManagementTab('포인트')}
            style={{
              backgroundColor: managementTab === '포인트' ? '#000000' : '#FFFFFF',
              color: managementTab === '포인트' ? 'white' : '#000',
              border: managementTab === '포인트' ? 'none' : '1px solid #ddd',
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
      
      {/* 회원 관리 컴포넌트 */}
      {managementTab === '회원' && (
        <MemberManagement 
          members={members} 
          loading={loading} 
          error={error} 
          fetchMembers={fetchMembers} 
        />
      )}
      
      {/* 스터디 관리 컴포넌트 */}
      {managementTab === '스터디' && (
        <StudyManagement studyData={studyData} />
      )}
      
      {/* 포인트 관리 컴포넌트 */}
      {managementTab === '포인트' && (
        <PointManagement />
      )}
    </div>
  );
}

ManagementTab.propTypes = {
  studyData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string
  }).isRequired
};

export default ManagementTab; 