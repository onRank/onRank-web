import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { managementService } from '../../../services/management';
import { studyService } from '../../../services/api';
import { getBackgroundImageStyle } from '../../../utils/imageUtils';

function StudyManagement() {
  const { studyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  
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

  // 이미지 로드 완료 핸들러
  const handleImageLoad = () => {
    console.log('이미지 로드 성공:', imageRef.current?.src);
    setImageLoaded(true);
    setError(null); // 이미지가 로드되면 이전 오류 메시지 제거
  };

  // 이미지 로드 실패 핸들러
  const handleImageError = () => {
    console.error('이미지 로드 실패:', studyImageUrl);
    setImageLoaded(false);
    
    // 에러 메시지 표시
    setError(`이미지 로드에 실패했습니다. URL: ${studyImageUrl}`);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchStudyData();
  }, [studyId]);

  // 스터디 정보 조회 함수
  const fetchStudyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await managementService.getManagementData(studyId);
      
      const data = response.data || {};
      
      setStudyName(data.studyName || '');
      setStudyDescription(data.studyContent || '');
      setStudyStatus(data.studyStatus || '');
      setPresentPoint(data.presentPoint || 0);
      setAbsentPoint(data.absentPoint || 0);
      setLatePoint(data.latePoint || 0);
      
      // 디버깅용 로그
      console.log('서버 응답 데이터:', response);
      
      // 이미지 URL 처리
      if (response.memberContext && response.memberContext.file && response.memberContext.file.fileUrl) {
        const imageUrl = response.memberContext.file.fileUrl;
        console.log('원본 이미지 URL:', imageUrl);
        
        // 원본 S3 URL을 직접 사용 (CloudFront URL로 변환하지 않음)
        setStudyImageUrl(imageUrl);
      } else {
        console.log('이미지 URL이 없음:', response);
        setStudyImageUrl('');
      }
    } catch (err) {
      console.error('스터디 정보 조회 실패:', err);
      setError('스터디 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
    
    // 취소 시 서버에서 다시 데이터 가져오기
    fetchStudyData();
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

  // 이미지 부분을 렌더링하는 코드
  const renderStudyImage = () => {
    if (!studyImageUrl) {
      return (
        <div style={{ 
          border: '1px dashed #ccc', 
          borderRadius: '8px', 
          padding: '30px', 
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          color: '#999',
          maxWidth: '300px'
        }}>
          등록된 이미지가 없습니다
        </div>
      );
    }
    
    return (
      <div style={{ 
        border: '3px solid #FF0000', 
        borderRadius: '8px', 
        padding: '15px', 
        display: 'inline-block',
        backgroundColor: '#f0f0f0',
        minHeight: '150px',
        minWidth: '200px',
        textAlign: 'center'
      }}>
        <img 
          ref={imageRef}
          src={studyImageUrl} 
          alt="스터디 이미지" 
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
          style={{ 
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: '4px', 
            border: '1px solid #000',
            backgroundColor: '#FFF',
            display: 'inline-block'
          }} 
        />
      </div>
    );
  };

  // 수정 모드에서 이미지 미리보기 수정
  const renderImagePreview = () => {
    if (!studyImageUrl) return null;
    
    return (
      <div style={{ width: '100px', height: '100px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #ddd' }}>
        <img 
          src={studyImageUrl} 
          alt="스터디 이미지 미리보기"
          crossOrigin="anonymous"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }}
          onError={(e) => {
            console.error('미리보기 이미지 로드 실패:', e.target.src);
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23CCCCCC%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2250%22%20font-size%3D%2210%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20fill%3D%22%23333333%22%3E%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%98%A4%EB%A5%98%3C%2Ftext%3E%3C%2Fsvg%3E';
          }} 
        />
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
      console.log('[StudyManagement] 폼 제출 시작', {
        hasImageFile: !!studyImageFile,
        imageFileInfo: studyImageFile ? {
          name: studyImageFile.name,
          size: studyImageFile.size,
          type: studyImageFile.type
        } : null
      });
      
      // API 요청 데이터 준비
      const requestData = {
        studyName: studyName,
        studyContent: studyDescription,
        studyStatus: studyStatus,
        fileName: studyImageFile ? studyImageFile.name : null,
        presentPoint: presentPoint,
        absentPoint: absentPoint,
        latePoint: latePoint
      };
      
      console.log('[StudyManagement] 요청 데이터:', requestData);
      
      // 스터디 정보 업데이트 요청
      const response = await managementService.updateStudyInfo(studyId, requestData);
      
      console.log('[StudyManagement] 업데이트 응답:', response);
      
      // 이미지 파일이 있는 경우 S3에 업로드
      if (studyImageFile) {
        // 응답에서 uploadUrl 추출 확인
        let uploadUrl = null;
        
        // 응답 구조 확인 및 uploadUrl 찾기
        if (response.data && response.data.uploadUrl) {
          uploadUrl = response.data.uploadUrl;
        } else if (response.uploadUrl) {
          uploadUrl = response.uploadUrl;
        } else {
          console.warn('[StudyManagement] uploadUrl을 찾을 수 없음:', response);
          
          // 응답 구조 탐색
          const extractUploadUrl = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            
            if (obj.uploadUrl) return obj.uploadUrl;
            
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const result = extractUploadUrl(obj[key]);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          uploadUrl = extractUploadUrl(response);
        }
        
        if (!uploadUrl) {
          console.error('[StudyManagement] uploadUrl이, response 데이터 내 어디에도 없음');
          setError('이미지 업로드 URL을 찾을 수 없습니다. 이미지 제외하고 정보만 업데이트되었습니다.');
          setIsEditing(false);
          
          // 정보만 업데이트되었으므로 데이터 다시 가져오기
          fetchStudyData();
          return;
        }
        
        console.log('[StudyManagement] 찾은 uploadUrl:', uploadUrl.substring(0, 100) + '...');
        
        try {
          // S3에 이미지 업로드
          console.log('[StudyManagement] S3 이미지 업로드 시작');
          await studyService.uploadImageToS3(uploadUrl, studyImageFile);
          console.log('[StudyManagement] S3 이미지 업로드 완료');
          
          // 이미지 업로드 후 브라우저 캐시 방지를 위한 지연
          setSuccess('스터디 정보가 성공적으로 업데이트되었습니다. 이미지 업로드 완료!');
        } catch (uploadError) {
          console.error('[StudyManagement] S3 이미지 업로드 실패:', uploadError);
          setSuccess('스터디 정보는 업데이트되었으나 이미지 업로드에 실패했습니다.');
        }
      } else {
        setSuccess('스터디 정보가 성공적으로 업데이트되었습니다.');
      }
      
      // 편집 모드 종료
      setIsEditing(false);
      
      // blob URL 정리 및 이미지 파일 상태 초기화
      if (studyImageUrl && studyImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(studyImageUrl);
      }
      setStudyImageFile(null);
      
      // 지연 후 업데이트된 정보 다시 가져오기 (S3 업로드 처리 시간 고려)
      setTimeout(() => {
        console.log('[StudyManagement] 업데이트 후 데이터 새로고침');
        fetchStudyData();
      }, 2000);
    } catch (err) {
      console.error('[StudyManagement] 스터디 정보 업데이트 실패:', err);
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
              {renderImagePreview()}
            </div>
            {studyImageUrl && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                현재 이미지가 표시됩니다. 변경하려면 새 이미지를 선택하세요.
              </div>
            )}
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
          
          {studyImageUrl ? (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>스터디 이미지</h4>
              {renderStudyImage()}
              
              <div style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>이미지 URL:</p>
                <p style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{studyImageUrl}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <a 
                    href={studyImageUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block',
                      color: '#0066cc',
                      textDecoration: 'underline'
                    }}
                  >
                    새 탭에서 이미지 열기
                  </a>
                  <button
                    onClick={fetchStudyData}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.8rem',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    이미지 새로고침
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>스터디 이미지</h4>
              {renderStudyImage()}
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