import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import AddMemberModal from '../../modals/AddMemberModal';
import { studyService } from '../../../../services/api';

function MemberManagement({ members, loading, error, fetchMembers }) {
  const { studyId } = useParams();
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false);
  const [processingMemberId, setProcessingMemberId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, memberId: null });
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // 팝업 닫기 함수
  const handleClosePopup = () => {
    setShowAddMemberPopup(false);
  };

  // 역할 변경 처리 함수
  const handleChangeRole = async (memberId, newRole) => {
    if (!memberId || !newRole) return;
    
    try {
      setProcessingMemberId(memberId);
      setStatusMessage({ text: '처리 중...', type: 'info' });
      
      await studyService.changeMemberRole(studyId, memberId, { role: newRole });
      
      setStatusMessage({ text: '역할이 변경되었습니다.', type: 'success' });
      fetchMembers(); // 멤버 목록 갱신
    } catch (error) {
      console.error('[MemberManagement] 역할 변경 실패:', error);
      setStatusMessage({ 
        text: error.message || '역할 변경에 실패했습니다.', 
        type: 'error' 
      });
    } finally {
      setProcessingMemberId(null);
      // 3초 후 상태 메시지 초기화
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
    }
  };

  // 멤버 삭제 확인 모달 표시
  const handleShowDeleteConfirm = (memberId) => {
    setConfirmModal({ show: true, type: 'delete', memberId });
  };

  // 멤버 삭제 처리 함수
  const handleDeleteMember = async () => {
    const { memberId } = confirmModal;
    if (!memberId) return;
    
    try {
      setProcessingMemberId(memberId);
      setStatusMessage({ text: '처리 중...', type: 'info' });
      
      await studyService.removeMember(studyId, memberId);
      
      setStatusMessage({ text: '멤버가 삭제되었습니다.', type: 'success' });
      fetchMembers(); // 멤버 목록 갱신
    } catch (error) {
      console.error('[MemberManagement] 멤버 삭제 실패:', error);
      setStatusMessage({ 
        text: error.message || '멤버 삭제에 실패했습니다.', 
        type: 'error' 
      });
    } finally {
      setProcessingMemberId(null);
      setConfirmModal({ show: false, type: null, memberId: null });
      // 3초 후 상태 메시지 초기화
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
    }
  };

  // 확인 모달 닫기
  const handleCloseConfirmModal = () => {
    setConfirmModal({ show: false, type: null, memberId: null });
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>회원 목록을 불러오는 중...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button 
              onClick={() => setShowAddMemberPopup(true)}
              style={{
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white"/>
              </svg>
              회원 추가
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
              {members.map((member) => (
                <tr key={member.studentId} style={{ 
                  borderBottom: '1px solid #E5E5E5',
                  backgroundColor: processingMemberId === member.studentId ? '#fafafa' : 'transparent'
                }}>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                    {member.studentName}
                  </td>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                    {member.studentEmail}
                  </td>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle' }}>
                    <select 
                      value={member.role || '로딩 안됨'} 
                      onChange={(e) => handleChangeRole(member.studentId, e.target.value)}
                      disabled={processingMemberId === member.studentId}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: member.role === 'LEADER' ? '#e3f2fd' : 'white'
                      }}
                    >
                      {!member.role && <option value="로딩 안됨">로딩 안됨</option>}
                      <option value="LEADER">리더</option>
                      <option value="MEMBER">일반 멤버</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleShowDeleteConfirm(member.studentId)}
                      disabled={processingMemberId === member.studentId || member.role === 'LEADER'}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: member.role === 'LEADER' ? 'not-allowed' : 'pointer',
                        opacity: member.role === 'LEADER' ? 0.5 : 1
                      }}
                      title={member.role === 'LEADER' ? '리더는 삭제할 수 없습니다' : '멤버 삭제'}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#E53935"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 회원 추가 팝업 */}
          {showAddMemberPopup && (
            <AddMemberModal
              onClose={handleClosePopup}
              onSuccess={fetchMembers}
            />
          )}
          
          {/* 멤버 삭제 확인 모달 */}
          {confirmModal.show && confirmModal.type === 'delete' && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '400px',
                maxWidth: '90%'
              }}>
                <h3 style={{ marginTop: 0 }}>멤버 삭제 확인</h3>
                <p>이 멤버를 정말 삭제하시겠습니까?</p>
                <p>이 작업은 되돌릴 수 없습니다.</p>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    onClick={handleCloseConfirmModal}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleDeleteMember}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

MemberManagement.propTypes = {
  members: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  fetchMembers: PropTypes.func.isRequired
};

export default MemberManagement; 