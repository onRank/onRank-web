import { useState } from 'react';
import PropTypes from 'prop-types';
import AddMemberModal from '../../modals/AddMemberModal';

function MemberManagement({ members, loading, error, fetchMembers }) {
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false);

  // 팝업 닫기 함수
  const handleClosePopup = () => {
    setShowAddMemberPopup(false);
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
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {members.map((member) => (
                <tr key={member.studentId} style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>{member.studentName}</div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#5C6BC0"/>
                          </svg>
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9H18V10.5H6V9ZM3.5 11.5L6 14L8.5 11.5H7V8H5V11.5H3.5ZM6 13.5H18V15H6V13.5Z" fill="#E53935"/>
                            <path d="M19 3L5 3C3.9 3 3 3.9 3 5L3 19C3 20.1 3.9 21 5 21L19 21C20.1 21 21 20.1 21 19L21 5C21 3.9 20.1 3 19 3ZM19 19L5 19L5 5L19 5L19 19Z" fill="#E53935"/>
                          </svg>
                        </button>
                      </div>
                    </div>
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