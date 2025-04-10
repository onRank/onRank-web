import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { managementService } from '../../../services/management';

function StudyManagement() {
  const { studyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // 스터디 정보 상태
  const [studyName, setStudyName] = useState('');
  const [studyDescription, setStudyDescription] = useState('');
  const [studyImageUrl, setStudyImageUrl] = useState('');
  const [studyImageFile, setStudyImageFile] = useState(null);
  const [studyStatus, setStudyStatus] = useState('');
  
  // 출석 점수 상태
  const [presentPoint, setPresentPoint] = useState(0);
  const [absentPoint, setAbsentPoint] = useState(0);
  const [latePoint, setLatePoint] = useState(0);

  // 스터디 정보 조회
  useEffect(() => {
    const fetchStudyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[StudyManagement] 스터디 정보 조회 시작:', studyId);
        const response = await managementService.getManagementData(studyId);
        console.log('[StudyManagement] 스터디 정보 조회 결과:', response);
        
        // API 응답 구조에 따라 데이터 추출
        const data = response.data || {};
        
        setStudyName(data.studyName || '');
        setStudyDescription(data.studyContent || '');
        setStudyImageUrl(data.studyImageUrl || '');
        setStudyStatus(data.studyStatus || 'PROGRESS');
        setPresentPoint(data.presentPoint ?? 5);
        setAbsentPoint(data.absentPoint ?? -10);
        setLatePoint(data.latePoint ?? -2);
      } catch (err) {
        console.error('스터디 정보 조회 실패:', err);
        setError('스터디 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudyData();
  }, [studyId]);

  // 이미지 파일 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStudyImageFile(file);
      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setStudyImageUrl(previewUrl);
    }
  };

  // 수정 모드 전환
  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  // 취소 버튼 처리
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    // 이미지 파일 선택 상태 초기화
    setStudyImageFile(null);
  };

  // 스터디 상태 표시
  const renderStudyStatus = () => {
    let statusText = '';
    let statusColor = '';
    
    switch (studyStatus) {
      case 'PREPARING':
        statusText = '준비 중';
        statusColor = '#2196F3';
        break;
      case 'PROGRESS':
        statusText = '진행 중';
        statusColor = '#4CAF50';
        break;
      case 'COMPLETED':
        statusText = '완료';
        statusColor = '#9E9E9E';
        break;
      default:
        statusText = studyStatus;
        statusColor = '#757575';
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>스터디 상태:</span>
        <span style={{ color: statusColor, fontWeight: 'bold' }}>{statusText}</span>
      </div>
    );
  };

  // 스터디 정보 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studyName.trim()) {
      setError('스터디 이름은 필수 입력 항목입니다.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('[StudyManagement] 스터디 정보 업데이트 시작:', studyId);
      
      // FormData 객체 생성
      const formData = new FormData();
      formData.append('studyName', studyName);
      formData.append('studyContent', studyDescription);
      formData.append('studyStatus', studyStatus);
      
      // 파일 관련 필드 처리
      if (studyImageFile) {
        formData.append('file', studyImageFile);
        formData.append('fileName', studyImageFile.name);
      } else {
        // 파일이 없을 경우 fileName을 명시적으로 null로 전송
        formData.append('fileName', 'null');
      }
      
      formData.append('presentPoint', presentPoint);
      formData.append('absentPoint', absentPoint);
      formData.append('latePoint', latePoint);
      
      // 디버깅: FormData 내용 확인
      console.log('[StudyManagement] FormData 내용:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${key === 'file' ? '파일 객체' : value}`);
      }
      
      // 스터디 정보 업데이트
      const response = await managementService.updateStudyInfo(studyId, formData);
      
      console.log('[StudyManagement] 스터디 정보 업데이트 성공:', response);
      setSuccess('스터디 정보가 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
    } catch (err) {
      console.error('스터디 정보 업데이트 실패:', err);
      setError(err.response?.data?.message || '스터디 정보 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>스터디 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>스터디 정보 관리</h3>
      
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
      
      {success && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.5rem 1rem', 
          backgroundColor: '#e6f7e6',
          color: '#2e7d32',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          {success}
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              스터디 이름
            </label>
            <input
              type="text"
              value={studyName}
              onChange={(e) => setStudyName(e.target.value)}
              placeholder="스터디 이름"
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              스터디 설명
            </label>
            <textarea
              value={studyDescription}
              onChange={(e) => setStudyDescription(e.target.value)}
              placeholder="스터디에 대한 간략한 설명"
              rows={4}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              스터디 상태
            </label>
            <select
              value={studyStatus}
              onChange={(e) => setStudyStatus(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              disabled={loading}
            >
              <option value="PREPARING">준비 중</option>
              <option value="PROGRESS">진행 중</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              스터디 이미지
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ flex: 1 }}
                disabled={loading}
              />
              {studyImageUrl && (
                <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '4px' }}>
                  <img 
                    src={studyImageUrl} 
                    alt="스터디 이미지" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </div>
          </div>
          
          <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>출석 점수 설정</h4>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                출석 점수
              </label>
              <input
                type="number"
                value={presentPoint}
                onChange={(e) => setPresentPoint(parseInt(e.target.value))}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                disabled={loading}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                결석 점수
              </label>
              <input
                type="number"
                value={absentPoint}
                onChange={(e) => setAbsentPoint(parseInt(e.target.value))}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                disabled={loading}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                지각 점수
              </label>
              <input
                type="number"
                value={latePoint}
                onChange={(e) => setLatePoint(parseInt(e.target.value))}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                disabled={loading}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              취소
            </button>
            
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#000000',
                color: 'white',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>기본 정보</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>스터디 이름:</span>
                <span>{studyName}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>스터디 설명:</span>
                <span>{studyDescription}</span>
              </div>
              
              {renderStudyStatus()}
            </div>
          </div>
          
          {studyImageUrl && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>스터디 이미지</h4>
              <img 
                src={studyImageUrl} 
                alt="스터디 이미지" 
                style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '4px' }} 
              />
            </div>
          )}
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>출석 점수 설정</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>출석:</span>
                <span>{presentPoint > 0 ? `+${presentPoint}` : presentPoint} 점</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>결석:</span>
                <span>{absentPoint > 0 ? `+${absentPoint}` : absentPoint} 점</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>지각:</span>
                <span>{latePoint > 0 ? `+${latePoint}` : latePoint} 점</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleEdit}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#000000',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              수정
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

StudyManagement.propTypes = {
  // PropTypes 정의
};

export default StudyManagement; 