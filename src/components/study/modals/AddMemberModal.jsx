import { useState } from 'react';
import PropTypes from 'prop-types';
import { studyService } from '../../../services/api';
import { useParams } from 'react-router-dom';

function AddMemberModal({ onClose, onSuccess }) {
  const { studyId } = useParams();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);

  // 회원 추가 함수
  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberEmail.trim()) {
      setAddMemberError('이메일을 입력해주세요.');
      return;
    }
    
    if (!newMemberEmail.includes('@')) {
      setAddMemberError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    setAddingMember(true);
    setAddMemberError(null);
    
    try {
      // 새로운 API 서비스 함수 사용하여 멤버 추가 - studentEmail만 전송
      const response = await studyService.addMember(studyId, {
        studentEmail: newMemberEmail.trim()
      });
      
      // 응답 데이터 처리 - { studyName, memberRole } 형식 처리
      console.log('회원 추가 성공 응답:', response);
      
      // API 응답이 { studyName, memberRole } 형식인 경우 처리 로직
      if (response && (response.studyName !== undefined || response.memberRole !== undefined)) {
        console.log(`스터디 '${response.studyName}'에 '${response.memberRole}' 역할로 사용자가 추가되었습니다.`);
      }
      
      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
      
      // 팝업 닫기
      onClose();
    } catch (err) {
      console.error('회원 추가 오류:', err);
      setAddMemberError(err.message || '회원 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAddingMember(false);
    }
  };

  return (
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
        borderRadius: '8px',
        padding: '2rem',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>회원 추가</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            이메일
          </label>
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="추가할 회원의 이메일을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          {addMemberError && (
            <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {addMemberError}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            취소하기
          </button>
          <button
            onClick={handleAddMember}
            disabled={addingMember}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#000',
              color: 'white',
              cursor: addingMember ? 'not-allowed' : 'pointer',
              opacity: addingMember ? 0.7 : 1
            }}
          >
            {addingMember ? '추가 중...' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

AddMemberModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default AddMemberModal; 