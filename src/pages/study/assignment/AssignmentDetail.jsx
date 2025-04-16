import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import assignmentService from '../../../services/assignment';
import { formatFileSize, getFileIcon, downloadFile } from '../../../utils/fileUtils';

const AssignmentDetail = () => {
  const { studyId, id: assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!studyId || !assignmentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await assignmentService.getAssignmentById(studyId, assignmentId);
        setAssignment(response.data || null);
      } catch (err) {
        console.error('과제 상세 정보 조회 실패:', err);
        setError('과제 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [studyId, assignmentId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('파일 선택:', selectedFile.name, formatFileSize(selectedFile.size));
      setFile(selectedFile);
      // 파일을 선택했으므로 이전 업로드 상태 초기화
      setUploadProgress(0);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
    setError(null);
    setUploadProgress(10); // 초기 진행률 표시

    try {
      const submissionData = {
        file: file,
        comment: '' // 필요시 주석 입력 기능 추가
      };
      
      // 진행률 표시를 위한 임의의 상태 업데이트
      // 실제로는 axios의 onUploadProgress를 사용하면 더 정확한 진행률 표시 가능
      setTimeout(() => setUploadProgress(30), 300);
      setTimeout(() => setUploadProgress(60), 600);
      
      // Swagger 문서에 정의된 API 형식으로 과제 제출
      await assignmentService.submitAssignment(studyId, assignmentId, submissionData);
      
      // 업로드 완료
      setUploadProgress(100);
      
      // 성공 메시지 표시
      alert('과제가 성공적으로 제출되었습니다.');
      
      // 제출 후 과제 정보 다시 로드
      const response = await assignmentService.getAssignmentById(studyId, assignmentId);
      setAssignment(response.data || null);
    } catch (error) {
      console.error('과제 제출 실패:', error);
      setError(`과제 제출에 실패했습니다: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate(`/studies/${studyId}/assignment`);
  };

  if (isLoading && !assignment) {
    return <LoadingContainer>과제 정보를 불러오는 중...</LoadingContainer>;
  }

  if (error && !assignment) {
    return (
      <ErrorContainer>
        <div>{error}</div>
        <BackButton onClick={handleBack}>목록으로 돌아가기</BackButton>
      </ErrorContainer>
    );
  }

  if (!assignment) {
    return <ErrorContainer>과제 정보를 찾을 수 없습니다.</ErrorContainer>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>← 목록으로</BackButton>
        <Title>{assignment.assignmentTitle}</Title>
        <DueDate>제출기한: {new Date(assignment.assignmentDueDate).toLocaleDateString()}</DueDate>
        <Status>상태: {assignment.submissionStatus || '미제출'}</Status>
      </Header>
      <Content>
        <Section>
          <SectionTitle>지시사항</SectionTitle>
          <Description>{assignment.assignmentContent}</Description>
        </Section>
        <Section>
          <SectionTitle>제출물</SectionTitle>
          {assignment.submissionInfo ? (
            <SubmittedFile>
              <FileInfoRow>
                <FileIcon>{getFileIcon(assignment.submissionInfo.fileName)}</FileIcon>
                <FileDetails>
                  <FileName>{assignment.submissionInfo.fileName}</FileName>
                  {assignment.submissionInfo.fileSize && (
                    <FileSize>{formatFileSize(assignment.submissionInfo.fileSize)}</FileSize>
                  )}
                </FileDetails>
                {assignment.submissionInfo.fileUrl && (
                  <DownloadButton 
                    onClick={() => downloadFile(
                      assignment.submissionInfo.fileUrl,
                      assignment.submissionInfo.fileName
                    )}
                  >
                    다운로드
                  </DownloadButton>
                )}
              </FileInfoRow>
              <SubmitDate>제출일: {new Date(assignment.submissionInfo.submittedDate).toLocaleDateString()}</SubmitDate>
              {assignment.submissionInfo.score && (
                <Score>점수: {assignment.submissionInfo.score}</Score>
              )}
            </SubmittedFile>
          ) : (
            <SubmissionForm>
              {/* 파일 선택 영역 */}
              <FileInputArea>
                <FileLabel>
                  <FileInput
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.zip,.ppt,.pptx"
                    disabled={isUploading}
                  />
                  {file ? (
                    <SelectedFileInfo>
                      <div>{getFileIcon(file.name)} {file.name}</div>
                      <div>{formatFileSize(file.size)}</div>
                    </SelectedFileInfo>
                  ) : (
                    <FileInputPlaceholder>
                      파일을 선택하거나 여기에 드래그하세요
                    </FileInputPlaceholder>
                  )}
                </FileLabel>
              </FileInputArea>
              
              {/* 업로드 진행 상태 표시 */}
              {isUploading && (
                <ProgressContainer>
                  <ProgressBar width={uploadProgress} />
                  <ProgressText>{uploadProgress}% 업로드 중...</ProgressText>
                </ProgressContainer>
              )}
              
              {/* 제출 버튼 */}
              <SubmitButton 
                onClick={handleSubmit} 
                disabled={isLoading || !file}
              >
                {isLoading ? '제출 중...' : '제출하기'}
              </SubmitButton>
              
              {/* 에러 메시지 */}
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </SubmissionForm>
          )}
        </Section>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const DueDate = styled.div`
  color: #666;
  font-size: 14px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Description = styled.p`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const SubmissionForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FileInputArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #007bff;
    background-color: rgba(0, 123, 255, 0.05);
  }
`;

const FileLabel = styled.label`
  cursor: pointer;
  display: block;
  width: 100%;
`;

const FileInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
`;

const FileInputPlaceholder = styled.div`
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '📎';
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

const SelectedFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  > div:first-child {
    font-weight: bold;
  }
  
  > div:last-child {
    color: #666;
    font-size: 14px;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #0056b3;
  }
`;

const SubmittedFile = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const FileName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
`;

const SubmitDate = styled.div`
  color: #666;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 20px;
  color: #dc3545;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
`;

const Status = styled.div`
  color: #666;
  font-size: 14px;
  margin-top: 4px;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 16px;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const Score = styled.div`
  color: #28a745;
  font-weight: bold;
  margin-top: 8px;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 8px;
`;

const ProgressContainer = styled.div`
  margin-bottom: 16px;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 4px;
  position: relative;
  height: 20px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #007bff;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: #fff;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
`;

const FileInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const FileIcon = styled.span`
  font-size: 24px;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileSize = styled.div`
  color: #666;
  font-size: 12px;
`;

const DownloadButton = styled.button`
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-left: auto;
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

export default AssignmentDetail; 