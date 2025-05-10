import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import { IoAttach } from 'react-icons/io5';
import { formatFileSize, isImageFile, getFilePreviewUrl } from '../../../utils/fileUtils';
import Button from '../../../components/common/Button';
import './AssignmentStyles.css';

function AssignmentCreate() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useStudyRole();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    assignmentTitle: '',
    assignmentContent: '',
    assignmentDueDate: '',
    assignmentMaxPoint: 100,
    fileNames: []
  });
  
  // 첨부 파일 상태
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  // 권한 체크 - 관리자만 접근 가능
  useEffect(() => {
    if (!isManager) {
      alert("과제 업로드 권한이 없습니다.");
      navigate(`/studies/${studyId}/assignment`);
    }
  }, [isManager, studyId, navigate]);
  
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
      // 파일 이름 배열 업데이트
      setFormData(prev => ({
        ...prev,
        fileNames: [...prev.fileNames, ...selectedFiles.map(file => file.name)]
      }));
    }
  };
  
  // 파일 첨부 버튼 클릭
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };
  
  // 첨부 파일 삭제
  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      fileNames: prev.fileNames.filter((_, i) => i !== index)
    }));
  };
  
  // 과제 업로드 제출 처리
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
      
      // 디버깅 로그: 첨부된 파일 확인
      console.log('[AssignmentCreate] 첨부된 파일:', attachedFiles);
      console.log('[AssignmentCreate] 첨부된 파일 목록:', attachedFiles.map(file => `${file.name} (${file.size} bytes)`));
      
      // ISO 형식으로 날짜 변환
      const formattedData = {
        ...formData,
        assignmentDueDate: new Date(formData.assignmentDueDate).toISOString(),
        files: attachedFiles // 파일 객체 배열 직접 추가
      };
      
      console.log('[AssignmentCreate] 과제 생성 요청 데이터:', formattedData);
      
      // 과제 업로드 API 호출 (preSignedURL 방식)
      await assignmentService.createAssignment(studyId, formattedData);
      
      alert('과제가 성공적으로 업로드되었습니다.');
      navigate(`/studies/${studyId}/assignment`); // 목록 페이지로 이동
    } catch (err) {
      console.error('과제 업로드 실패:', err);
      setError(`과제 업로드에 실패했습니다: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 취소 처리
  const handleCancel = () => {
    navigate(`/studies/${studyId}/assignment`);
  };
  
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">과제 업로드</h1>
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
          <div 
            className="date-picker-wrapper"
            onClick={() => {
              document.getElementById('assignmentDueDate').focus();
              document.getElementById('assignmentDueDate').showPicker();
            }}
          >
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
        
        {/* 첨부 파일 영역 */}
        <div className="form-group">
          <label className="label">첨부 파일</label>
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
          <Button variant="back" onClick={handleCancel} />
          <Button 
            variant="upload" 
            onClick={handleSubmit}
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}

export default AssignmentCreate; 