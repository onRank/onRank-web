import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import Button from '../../../components/common/Button';
import FileUploader from '../../../components/common/FileUploader';
import { formatFileSize } from '../../../utils/fileUtils';
import './AssignmentStyles.css';

function AssignmentCreate() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useStudyRole();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
  const handleFileSelect = (files) => {
    setAttachedFiles(files);
    
    // 파일 이름 배열 업데이트
    setFormData(prev => ({
      ...prev,
      fileNames: files.map(file => file.name)
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
      
      // FormData 객체 생성 (파일 업로드를 위해)
      const requestFormData = new FormData();
      
      // 필수 필드 추가
      requestFormData.append('assignmentTitle', formData.assignmentTitle);
      requestFormData.append('assignmentContent', formData.assignmentContent);
      requestFormData.append('assignmentMaxPoint', formData.assignmentMaxPoint.toString());
      
      // ISO 형식으로 날짜 변환
      const dueDateISO = new Date(formData.assignmentDueDate).toISOString();
      requestFormData.append('assignmentDueDate', dueDateISO);
      
      // 파일 이름 추가 (각각 별도로 추가)
      attachedFiles.forEach(file => {
        requestFormData.append('fileNames', file.name);
      });
      
      // 파일 객체 추가
      attachedFiles.forEach(file => {
        // 'files' 키로 모든 파일 추가 (서버 처리 방식에 맞게)
        requestFormData.append('files', file);
      });
      
      console.log('[AssignmentCreate] 과제 생성 요청 구성 완료:');
      console.log(' - 제목:', formData.assignmentTitle);
      console.log(' - 마감기한:', dueDateISO);
      console.log(' - 최대 포인트:', formData.assignmentMaxPoint);
      console.log(' - 파일 개수:', attachedFiles.length);
      
      // FormData 내용 확인
      for (const [key, value] of requestFormData.entries()) {
        if (value instanceof File) {
          console.log(` - ${key}: ${value.name} (${formatFileSize(value.size)})`);
        } else {
          console.log(` - ${key}: ${value}`);
        }
      }
      
      // 과제 업로드 API 호출 (FormData 객체 사용)
      await assignmentService.createAssignment(studyId, requestFormData);
      
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
    <>
      <h1 className="page-title">과제 추가</h1>
      
      <form className="form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="form-group">
          <label className="label" htmlFor="assignmentTitle">
            <span style={{color: '#ee0418', marginRight: '4px'}}>*</span>제목
          </label>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="label" htmlFor="assignmentContent">
              <span style={{color: '#ee0418', marginRight: '4px'}}>*</span>지시사항
            </label>
            <div className="char-count">{formData.assignmentContent.length}/10000</div>
          </div>
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
        </div>
        
        <div className="form-group">
          <label className="label" htmlFor="assignmentDueDate">
            <span style={{color: '#ee0418', marginRight: '4px'}}>*</span>마감기한
          </label>
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
          <label className="label" htmlFor="assignmentMaxPoint">
            <span style={{color: '#ee0418', marginRight: '4px'}}>*</span>최대 포인트
          </label>
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
        
        {/* 파일 업로더 컴포넌트 사용 */}
        <div className="form-group">
          <label className="label">첨부파일 추가</label>
          <FileUploader 
            existingFiles={[]} 
            onFileSelect={handleFileSelect}
          />
        </div>
        
        <div className="button-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button 
            variant="upload" 
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '60px', 
              height: '32px',
              fontSize: '12px'
            }}
          />
          <Button 
            variant="back" 
            type="button"
            onClick={handleCancel}
            style={{ 
              width: '60px', 
              height: '32px',
              fontSize: '12px'
            }}
          />
          
        </div>
      </form>
    </>
  );
}

export default AssignmentCreate; 