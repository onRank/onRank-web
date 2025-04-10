import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import MemberAddModal from './MemberAddModal';
import { managementService } from '../../../services/management';

function MemberManagement() {
  const { studyId } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [processingMemberId, setProcessingMemberId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // 멤버 목록 조회 함수
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await managementService.getMembers(studyId);
      console.log('[MemberManagement] 받은 회원 데이터:', response);
      
      // API 응답 구조에 따라 적절히 데이터 추출
      if (response && response.data) {
        // data 필드가 배열인 경우
        if (Array.isArray(response.data)) {
          setMembers(response.data);
        } 
        // data 필드가 객체이고 내부에 members 배열이 있는 경우
        else if (response.data.members && Array.isArray(response.data.members)) {
          setMembers(response.data.members);
        }
        // data 필드 자체가 객체인 경우 (배열 형태로 변환 필요)
        else if (typeof response.data === 'object') {
          // 적절한 키로 멤버 데이터 배열 찾기 (API 구조에 따라 조정 필요)
          let foundMembers = null;
          const possibleArrays = ['members', 'memberList', 'data'];
          for (const key of possibleArrays) {
            if (response.data[key] && Array.isArray(response.data[key])) {
              foundMembers = response.data[key];
              setMembers(foundMembers);
              break;
            }
          }
          
          // 배열을 찾지 못한 경우 빈 배열 설정
          if (!foundMembers) {
            console.warn('[MemberManagement] 회원 데이터 배열을 찾을 수 없습니다:', response.data);
            setMembers([]);
          }
        } else {
          console.warn('[MemberManagement] 예상치 못한 데이터 형식:', response.data);
          setMembers([]);
        }
      } else {
        // 데이터 필드가 없는 경우
        console.warn('[MemberManagement] 회원 데이터가 없습니다:', response);
        setMembers([]);
      }
    } catch (err) {
      console.error('멤버 목록 조회 실패:', err);
      setError('멤버 목록을 불러오는데 실패했습니다.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 멤버 목록 조회
  useEffect(() => {
    fetchMembers();
  }, [studyId]);

  // 역할 변경 처리 함수
  const handleChangeRole = async (memberId, newRole) => {
    if (!memberId || !newRole) return;
    
    // 스터디 생성자는 역할 변경 불가
    const memberToChange = members.find(m => m.id === memberId);
    if (memberToChange?.role === 'OWNER') {
      setStatusMessage({ text: '스터디 생성자의 역할은 변경할 수 없습니다.', type: 'error' });
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      return;
    }
    
    try {
      setProcessingMemberId(memberId);
      setStatusMessage({ text: '처리 중...', type: 'info' });
      
      await managementService.updateMemberRole(studyId, memberId, newRole);
      
      setStatusMessage({ text: '역할이 변경되었습니다.', type: 'success' });
      fetchMembers(); // 멤버 목록 갱신
    } catch (error) {
      console.error('역할 변경 실패:', error);
      setStatusMessage({ 
        text: error.response?.data?.message || '역할 변경에 실패했습니다.', 
        type: 'error' 
      });
    } finally {
      setProcessingMemberId(null);
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
    }
  };

  // 멤버 삭제 처리 함수
  const handleDeleteMember = async (memberId) => {
    if (!memberId) return;
    
    // 스터디 생성자와 관리자는 삭제 불가
    const memberToDelete = members.find(m => m.id === memberId);
    if (memberToDelete?.role === 'OWNER') {
      setStatusMessage({ text: '스터디 생성자는 삭제할 수 없습니다.', type: 'error' });
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      return;
    }
    
    if (memberToDelete?.role === 'MANAGER') {
      setStatusMessage({ text: '관리자는 삭제할 수 없습니다.', type: 'error' });
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      return;
    }
    
    if (window.confirm('정말로 이 멤버를 삭제하시겠습니까?')) {
      try {
        setProcessingMemberId(memberId);
        setStatusMessage({ text: '처리 중...', type: 'info' });
        
        await managementService.removeMember(studyId, memberId);
        
        setStatusMessage({ text: '멤버가 삭제되었습니다.', type: 'success' });
        fetchMembers(); // 멤버 목록 갱신
      } catch (error) {
        console.error('멤버 삭제 실패:', error);
        setStatusMessage({ 
          text: error.response?.data?.message || '멤버 삭제에 실패했습니다.', 
          type: 'error' 
        });
      } finally {
        setProcessingMemberId(null);
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      }
    }
  };

  // 역할 표시명 가져오기
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'OWNER': return '생성자';
      case 'MANAGER': return '관리자';
      case 'MEMBER': return '일반 회원';
      default: return role;
    }
  };
  
  // 새 멤버 추가 후 콜백
  const handleMemberAdded = (newMember) => {
    fetchMembers();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>회원 관리</h3>
        <button 
          onClick={() => setShowAddMemberModal(true)}
          style={{
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>+</span> 회원 추가
        </button>
      </div>
      
      {/* 상태 메시지 표시 */}
      {statusMessage.text && (
        <div 
          style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: statusMessage.type === 'success' ? '#e6f7e6' : 
                            statusMessage.type === 'error' ? '#ffebee' : '#e3f2fd',
            color: statusMessage.type === 'success' ? '#2e7d32' : 
                  statusMessage.type === 'error' ? '#c62828' : '#1565c0',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}
        >
          {statusMessage.text}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>회원 목록을 불러오는 중...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>이름</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>이메일</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>역할</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} style={{ 
                  borderBottom: '1px solid #E5E5E5',
                  backgroundColor: processingMemberId === member.id ? '#fafafa' : 'transparent'
                }}>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                    {member.name}
                  </td>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                    {member.email}
                  </td>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                    {member.role !== 'OWNER' ? (
                      <select 
                        value={member.role} 
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        disabled={processingMemberId === member.id}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          backgroundColor: member.role === 'OWNER' ? '#ffebee' :
                                          member.role === 'MANAGER' ? '#e3f2fd' : 'white'
                        }}
                      >
                        <option value="MANAGER">관리자</option>
                        <option value="MEMBER">일반 회원</option>
                      </select>
                    ) : (
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#ffebee',
                        borderRadius: '4px',
                        color: '#c62828',
                        fontWeight: 'bold'
                      }}>
                        {getRoleDisplayName(member.role)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                    {/* 스터디 생성자와 관리자는 삭제 버튼 표시하지 않음 */}
                    {member.role !== 'OWNER' && member.role !== 'MANAGER' ? (
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={processingMemberId === member.id}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer'
                        }}
                        title="멤버 삭제"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#E53935"/>
                        </svg>
                      </button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      
      {/* 회원 추가 모달 */}
      {showAddMemberModal && (
        <MemberAddModal
          studyId={studyId}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}

MemberManagement.propTypes = {
  // PropTypes 정의
};

export default MemberManagement; 