import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import { IoAttach } from 'react-icons/io5';
import { formatFileSize, isImageFile, getFilePreviewUrl, revokeFilePreviewUrl } from '../../../utils/fileUtils';
import './AssignmentStyles.css';

function AssignmentEdit() {
  const { studyId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useStudyRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    assignmentTitle: '',
    assignmentContent: '',
    assignmentDueDate: '',
    assignmentMaxPoint: 100,
    remainingFileIds: [],
    newFileNames: []
  });
  
  // 첨부 파일 상태
  const [attachedFiles, setAttachedFiles] = useState([]);
  // 기존 파일 상태
  const [existingFiles, setExistingFiles] = useState([]);
  
  // 권한 체크 - 관리자만 접근 가능
  useEffect(() => {
    if (!isManager) {
      alert("과제 수정 권한이 없습니다.");
      navigate(`/studies/${studyId}/assignment`);
    }
  }, [isManager, studyId, navigate]);
  
  // 과제 데이터 불러오기
  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!studyId || !assignmentId) {
        console.error("[AssignmentEdit] studyId 또는 assignmentId가 없음:", { studyId, assignmentId });
        return;
      }
      
      setIsFetching(true);
      setError(null);
      
      try {
        console.log(`[AssignmentEdit] 과제 데이터 조회 시작: studyId=${studyId}, assignmentId=${assignmentId}`);
        const response = await assignmentService.getAssignmentForEdit(studyId, assignmentId);
        console.log(`[AssignmentEdit] 과제 데이터 조회 성공:`, response);
        
        // 날짜 처리 안전하게 수정
        let dueDateString = '';
        try {
          if (response.data.assignmentDueDate) {
            const dueDate = new Date(response.data.assignmentDueDate);
            if (!isNaN(dueDate.getTime())) {
              dueDateString = dueDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM" 형식으로 잘라냄
            } else {
              console.warn('[AssignmentEdit] 유효하지 않은 날짜 형식:', response.data.assignmentDueDate);
            }
          }
        } catch (dateError) {
          console.error('[AssignmentEdit] 날짜 변환 오류:', dateError);
        }
        
        // 기존 파일에서 ID 추출하여 remainingFileIds 설정
        const fileIds = response.data.assignmentFiles?.map(file => file.fileId) || [];
        
        setFormData({
          assignmentTitle: response.data.assignmentTitle || '',
          assignmentContent: response.data.assignmentContent || '',
          assignmentDueDate: dueDateString,
          assignmentMaxPoint: response.data.assignmentMaxPoint || 100,
          remainingFileIds: fileIds,
          newFileNames: []
        });
        
        // 기존 파일 설정
        if (response.data.assignmentFiles && response.data.assignmentFiles.length > 0) {
          setExistingFiles(response.data.assignmentFiles);
        }
      } catch (err) {
        console.error('[AssignmentEdit] 과제 조회 실패:', err);
        setError('과제 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchAssignmentData();
  }, [studyId, assignmentId]);
  
  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };
  
  // 파일 첨부 처리
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...selectedFiles]);
      // 새 파일 이름 배열 업데이트
      setFormData(prev => ({
        ...prev,
        newFileNames: [...prev.newFileNames, ...selectedFiles.map(file => file.name)]
      }));
    }
  };
  
  // 파일 첨부 버튼 클릭
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };
  
  // 기존 첨부 파일 삭제
  const handleRemoveExistingFile = (index, fileId) => {
    // 기존 파일 목록에서 해당 파일 제거
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
    
    // remainingFileIds에서 해당 파일의 ID 제거
    setFormData(prev => ({
      ...prev,
      remainingFileIds: prev.remainingFileIds.filter(id => id !== fileId)
    }));
  };
  
  // 새로 첨부한 파일 삭제
  const handleRemoveFile = (index) => {
    // 새 파일 목록에서 해당 파일 제거
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    
    // newFileNames에서 해당 파일 이름 제거
    setFormData(prev => ({
      ...prev,
      newFileNames: prev.newFileNames.filter((_, i) => i !== index)
    }));
  };
  
  // 과제 수정 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 입력값 검증
    if (!formData.assignmentTitle.trim()) {
      setError('과제 제목을 입력해주세요.');
      return;
    }
    
    if (!formData.assignmentContent.trim()) {
      setError('과제 내용을 입력해주세요.');
      return;
    }
    
    if (!formData.assignmentDueDate) {
      setError('제출 기한을 선택해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // FormData 객체 생성
      const formDataObj = new FormData();
      formDataObj.append('assignmentTitle', formData.assignmentTitle);
      formDataObj.append('assignmentContent', formData.assignmentContent);
      
      // 날짜 안전하게 변환
      try {
        const dueDate = new Date(formData.assignmentDueDate);
        if (!isNaN(dueDate.getTime())) {
          formDataObj.append('assignmentDueDate', dueDate.toISOString());
        } else {
          throw new Error('유효하지 않은 날짜 형식입니다.');
        }
      } catch (dateError) {
        console.error('[AssignmentEdit] 날짜 변환 오류:', dateError);
        setError('날짜 형식이 올바르지 않습니다. 다시 선택해주세요.');
        setIsLoading(false);
        return;
      }
      
      formDataObj.append('assignmentMaxPoint', formData.assignmentMaxPoint);
      
      // 남길 기존 파일 ID 추가 (각각 별도의 remainingFileIds 파라미터로)
      formData.remainingFileIds.forEach(fileId => {
        formDataObj.append('remainingFileIds', fileId);
      });
      
      // 새 파일 이름 추가 (각각 별도의 newFileNames 파라미터로)
      formData.newFileNames.forEach(fileName => {
        formDataObj.append('newFileNames', fileName);
      });
      
      // 새 파일 추가
      attachedFiles.forEach(file => {
        formDataObj.append('files', file);
      });
      
      console.log('[AssignmentEdit] 남길 파일 ID:', formData.remainingFileIds);
      console.log('[AssignmentEdit] 새로 첨부된 파일:', attachedFiles.map(f => f.name));
      console.log('[AssignmentEdit] 새 파일 이름 목록:', formData.newFileNames);
      
      // 과제 수정 API 호출
      await assignmentService.updateAssignment(studyId, assignmentId, formDataObj);
      
      alert('과제가 성공적으로 수정되었습니다.');
      navigate(`/studies/${studyId}/assignment`); // 목록 페이지로 이동
    } catch (err) {
      console.error('과제 수정 실패:', err);
      setError(`과제 수정에 실패했습니다: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 취소 처리
  const handleCancel = () => {
    navigate(`/studies/${studyId}/assignment`);
  };
  
  if (isFetching) {
    return <div className="loading-message">과제 정보를 불러오는 중...</div>;
  }
  
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">과제 수정</h1>
        <button className="back-button" onClick={handleCancel}>목록으로 돌아가기</button>
      </div>
      
      <form className="form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="form-group">
          <label className="label" htmlFor="assignmentTitle">과제 제목 *</label>
          <input
            className="input"
            id="assignmentTitle"
            name="assignmentTitle"
            value={formData.assignmentTitle}
            onChange={handleChange}
            placeholder="과제 제목을 입력하세요"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="label" htmlFor="assignmentContent">지시사항 *</label>
          <textarea
            className="textarea"
            id="assignmentContent"
            name="assignmentContent"
            value={formData.assignmentContent}
            onChange={handleChange}
            placeholder="과제 내용과 지시사항을 입력하세요"
            rows={6}
            required
          />
          <div className="char-count">{formData.assignmentContent.length}/10000</div>
        </div>
        
        <div className="form-group">
          <label className="label" htmlFor="assignmentDueDate">제출 기한 *</label>
          <input
            className="input"
            id="assignmentDueDate"
            name="assignmentDueDate"
            type="datetime-local"
            value={formData.assignmentDueDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="label" htmlFor="assignmentMaxPoint">최대 점수</label>
          <input
            className="input"
            id="assignmentMaxPoint"
            name="assignmentMaxPoint"
            type="number"
            min="0"
            value={formData.assignmentMaxPoint}
            onChange={handleChange}
          />
        </div>
        
        {/* 기존 첨부 파일 영역 */}
        {existingFiles.length > 0 && (
          <div className="form-group">
            <label className="label">기존 첨부 파일</label>
            <div className="file-list">
              {existingFiles.map((file, index) => (
                <div className="file-item" key={file.fileId}>
                  {isImageFile(file.fileUrl) && (
                    <div className="image-preview">
                      <img src={file.fileUrl} alt={file.fileName} />
                    </div>
                  )}
                  <div className="file-info">
                    <span className="file-name">{file.fileName}</span>
                    <span className="file-size">{file.fileSize ? `(${formatFileSize(file.fileSize)})` : ''}</span>
                  </div>
                  <button 
                    className="remove-file-button" 
                    onClick={() => handleRemoveExistingFile(index, file.fileId)} 
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 새 첨부 파일 영역 */}
        <div className="form-group">
          <label className="label">새 첨부 파일</label>
          <input 
            className="hidden-file-input"
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
          />
          
          {/* 첨부파일 목록 */}
          {attachedFiles.length > 0 && (
            <div className="file-list">
              {attachedFiles.map((file, index) => (
                <div className="file-item" key={index}>
                  {isImageFile(file) && (
                    <div className="image-preview">
                      <img src={getFilePreviewUrl(file)} alt={file.name} />
                    </div>
                  )}
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({formatFileSize(file.size)})</span>
                  </div>
                  <button 
                    className="remove-file-button" 
                    onClick={() => handleRemoveFile(index)} 
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button className="attach-button" type="button" onClick={handleAttachClick}>
            <IoAttach size={18} />
            파일 첨부
          </button>
        </div>
        
        <div className="button-group">
          <button className="button cancel-button" type="button" onClick={handleCancel}>취소</button>
          <button className="button submit-button" type="submit" disabled={isLoading}>
            {isLoading ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignmentEdit; 