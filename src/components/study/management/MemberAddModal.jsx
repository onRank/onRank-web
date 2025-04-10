import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { managementService } from '../../../services/management';
import './MemberAddModal.css';

function MemberAddModal({ studyId, onClose, onMemberAdded }) {
  const [email, setEmail] = useState('');
  const [memberRole, setMemberRole] = useState('PARTICIPANT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await managementService.addMember(studyId, { studentEmail: email, memberRole });
      
      if (response && response.data) {
        setSuccess('회원이 추가되었습니다.');
        setEmail('');
        
        // 부모 컴포넌트에 추가된 회원 정보 전달
        if (onMemberAdded) {
          onMemberAdded(response.data);
        }
      } else {
        setError('회원 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('[MemberAddModal] 회원 추가 실패:', err);
      
      // 에러 메시지가 있으면 그대로 표시하고, 없으면 기본 메시지 표시
      if (err.message) {
        setError(err.message);
      } else {
        setError(err.response?.data?.message || '회원 추가에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>회원 추가</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="초대할 사용자의 이메일"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">역할:</label>
            <select
              id="role"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              disabled={loading}
            >
              <option value="PARTICIPANT">일반 회원</option>
              <option value="HOST">관리자</option>
            </select>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              취소
            </button>
            <button type="submit" disabled={loading}>
              {loading ? '처리 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

MemberAddModal.propTypes = {
  studyId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberAdded: PropTypes.func
};

export default MemberAddModal; 