import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';

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
      
      // ISO 형식으로 날짜 변환
      const formattedData = {
        ...formData,
        assignmentDueDate: new Date(formData.assignmentDueDate).toISOString()
      };
      
      // 과제 업로드 API 호출
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
          <Label htmlFor="assignmentContent">과제 내용 *</Label>
          <TextArea
            id="assignmentContent"
            name="assignmentContent"
            value={formData.assignmentContent}
            onChange={handleChange}
            placeholder="과제 내용과 지시사항을 입력하세요"
            rows={6}
            required
          />
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
        
        {/* 추가 구현 가능: 첨부 파일 목록 관리 */}
        
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
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background-color: #f8f9fa;
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
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

export default AssignmentCreate; 