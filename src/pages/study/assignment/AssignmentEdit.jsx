import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import { IoAttach } from 'react-icons/io5';
import { formatFileSize } from '../../../utils/fileUtils';

function AssignmentEdit() {
  const { studyId, id: assignmentId } = useParams();
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
    fileNames: []
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
      if (!studyId || !assignmentId) return;
      
      setIsFetching(true);
      setError(null);
      
      try {
        const response = await assignmentService.getAssignmentForEdit(studyId, assignmentId);
        
        // ISO 문자열에서 로컬 datetime-local 형식으로 변환
        const dueDate = new Date(response.assignmentDueDate);
        const dueDateString = dueDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM" 형식으로 잘라냄
        
        setFormData({
          assignmentTitle: response.assignmentTitle || '',
          assignmentContent: response.assignmentContent || '',
          assignmentDueDate: dueDateString,
          assignmentMaxPoint: response.assignmentMaxPoint || 100,
          fileNames: []
        });
        
        // 기존 파일 설정
        if (response.files && response.files.length > 0) {
          setExistingFiles(response.files);
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
  
  // 기존 첨부 파일 삭제
  const handleRemoveExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // 새로 첨부한 파일 삭제
  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      fileNames: prev.fileNames.filter((_, i) => i !== index)
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
      formDataObj.append('assignmentDueDate', new Date(formData.assignmentDueDate).toISOString());
      formDataObj.append('assignmentMaxPoint', formData.assignmentMaxPoint);
      
      // 기존 파일 이름만 추가 (Swagger API 형식에 맞게)
      const fileNames = [...existingFiles.map(file => file.fileName)];
      
      // 새 파일의 이름 추가
      attachedFiles.forEach(file => {
        fileNames.push(file.name);
      });
      
      // 파일 이름 배열 추가 (각각 별도의 fileNames 파라미터로)
      fileNames.forEach(fileName => {
        formDataObj.append('fileNames', fileName);
      });
      
      // 새 파일 추가
      attachedFiles.forEach(file => {
        formDataObj.append('files', file);
      });
      
      console.log('[AssignmentEdit] 기존 파일:', existingFiles.map(f => f.fileName));
      console.log('[AssignmentEdit] 새로 첨부된 파일:', attachedFiles.map(f => f.name));
      console.log('[AssignmentEdit] 전체 파일명 목록:', fileNames);
      
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
    return <LoadingMessage>과제 정보를 불러오는 중...</LoadingMessage>;
  }
  
  return (
    <Container>
      <Header>
        <Title>과제 수정</Title>
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
          
          {/* 기존 첨부파일 목록 */}
          {existingFiles.length > 0 && (
            <>
              <FileListLabel>기존 파일</FileListLabel>
              <FileList>
                {existingFiles.map((file, index) => (
                  <FileItem key={`existing-${index}`}>
                    <FileName>{file.fileName}</FileName>
                    <RemoveFileButton onClick={() => handleRemoveExistingFile(index)}>
                      ×
                    </RemoveFileButton>
                  </FileItem>
                ))}
              </FileList>
            </>
          )}
          
          {/* 새로 첨부된 파일 목록 */}
          {attachedFiles.length > 0 && (
            <>
              <FileListLabel>새로 추가된 파일</FileListLabel>
              <FileList>
                {attachedFiles.map((file, index) => (
                  <FileItem key={`new-${index}`}>
                    <FileName>{file.name}</FileName>
                    <FileSize>({formatFileSize(file.size)})</FileSize>
                    <RemoveFileButton onClick={() => handleRemoveFile(index)}>
                      ×
                    </RemoveFileButton>
                  </FileItem>
                ))}
              </FileList>
            </>
          )}
          
          <AttachButton type="button" onClick={handleAttachClick}>
            <IoAttach size={18} />
            파일 첨부
          </AttachButton>
        </FormGroup>
        
        <ButtonGroup>
          <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
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
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const Form = styled.form`
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  
  &::after {
    content: attr(data-required);
    color: #dc3545;
    margin-left: 4px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileListLabel = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FileList = styled.div`
  margin-bottom: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  background-color: #f8f9fa;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileName = styled.span`
  font-size: 13px;
  margin-right: 8px;
  flex: 1;
  word-break: break-all;
`;

const FileSize = styled.span`
  font-size: 12px;
  color: #666;
  margin-right: 8px;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
  
  &:hover {
    color: #bd2130;
  }
`;

const AttachButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
  
  &:hover {
    background-color: #e9ecef;
  }
  
  svg {
    margin-right: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #333;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #dc3545;
  border: none;
  color: white;
  
  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
`;

export default AssignmentEdit; 