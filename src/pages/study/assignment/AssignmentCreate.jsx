import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import { IoAttach } from 'react-icons/io5';

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
    <Container>
      <Header>
        <Title>과제 업로드</Title>
        <BackButton onClick={handleCancel}>목록으로 돌아가기</BackButton>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        <FormGroup>
          <Label htmlFor="assignmentTitle">과제 제목 *</Label>
          <Input
            id="assignmentTitle"
            name="assignmentTitle"
            value={formData.assignmentTitle}
            onChange={handleChange}
            placeholder="과제 제목을 입력하세요"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="assignmentContent">지시사항 *</Label>
          <TextArea
            id="assignmentContent"
            name="assignmentContent"
            value={formData.assignmentContent}
            onChange={handleChange}
            placeholder="과제 내용과 지시사항을 입력하세요"
            rows={6}
            required
          />
          <CharCount>{formData.assignmentContent.length}/10000</CharCount>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="assignmentDueDate">제출 기한 *</Label>
          <Input
            id="assignmentDueDate"
            name="assignmentDueDate"
            type="datetime-local"
            value={formData.assignmentDueDate}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="assignmentMaxPoint">최대 점수</Label>
          <Input
            id="assignmentMaxPoint"
            name="assignmentMaxPoint"
            type="number"
            min="0"
            max="100"
            value={formData.assignmentMaxPoint}
            onChange={handleChange}
          />
        </FormGroup>
        
        {/* 첨부 파일 영역 */}
        <FormGroup>
          <Label>첨부 파일</Label>
          <HiddenFileInput 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
          />
          
          {/* 첨부된 파일 목록 */}
          {attachedFiles.length > 0 && (
            <FileList>
              {attachedFiles.map((file, index) => (
                <FileItem key={index}>
                  <FileName>{file.name}</FileName>
                  <FileSize>({(file.size / 1024).toFixed(1)} KB)</FileSize>
                  <RemoveFileButton onClick={() => handleRemoveFile(index)}>
                    ×
                  </RemoveFileButton>
                </FileItem>
              ))}
            </FileList>
          )}
          
          <AttachButton type="button" onClick={handleAttachClick}>
            <IoAttach size={18} />
            파일 첨부
          </AttachButton>
        </FormGroup>
        
        <ButtonGroup>
          <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? '업로드 중...' : '업로드'}
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
}

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const Form = styled.form`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #212529;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
`;

const CharCount = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  color: #6c757d;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const ErrorMessage = styled.div`
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8d7da;
  color: #dc3545;
  border-radius: 4px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const AttachButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background-color: #f8f9fa;
`;

const FileName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

const FileSize = styled.span`
  font-size: 12px;
  color: #6c757d;
  margin-right: 8px;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
`;

export default AssignmentCreate; 