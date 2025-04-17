import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import assignmentService from '../../../services/assignment';
import { formatFileSize, getFileIcon, downloadFile } from '../../../utils/fileUtils';

const AssignmentDetail = () => {
  const { studyId, id: assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [memberContext, setMemberContext] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!studyId || !assignmentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await assignmentService.getAssignmentById(studyId, assignmentId);
        console.log('과제 상세 정보:', response);
        
        // API 응답 구조에 맞게 데이터 저장
        if (response.memberContext) {
          setMemberContext(response.memberContext);
        }
        
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
        comment: comment
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
      if (response.memberContext) {
        setMemberContext(response.memberContext);
      }
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

  // 마감일 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 제출 상태에 따른 점수 표시 
  const getScoreDisplay = () => {
    if (assignment.submissionStatus === 'SCORED' && assignment.submissionScore !== null) {
      return `${assignment.submissionScore}/${assignment.assignmentMaxPoint} pt`;
    }
    return `--/${assignment.assignmentMaxPoint} pt`;
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>← 목록으로</BackButton>
        <Title>{assignment.assignmentTitle}</Title>
        <InfoRow>
          <DueDate>마감: {formatDate(assignment.assignmentDueDate)}</DueDate>
          <PointDisplay>{getScoreDisplay()}</PointDisplay>
        </InfoRow>
      </Header>

      <Content>
        {/* 1. 지시사항 섹션 */}
        <Section>
          <SectionTitle>지시사항</SectionTitle>
          <Description>{assignment.assignmentContent}</Description>
          
          {/* 첨부 파일 목록 (assignmentFiles) */}
          {assignment.assignmentFiles && assignment.assignmentFiles.length > 0 && (
            <FilesContainer>
              <FilesTitle>첨부파일</FilesTitle>
              <FilesList>
                {assignment.assignmentFiles.map((file, index) => (
                  <FileItem key={index}>
                    <FileInfoRow>
                      <FileIcon>{getFileIcon(file.fileName)}</FileIcon>
                      <FileDetails>
                        <FileName>{file.fileName}</FileName>
                      </FileDetails>
                      <DownloadButton 
                        onClick={() => downloadFile(file.fileUrl, file.fileName)}
                      >
                        다운로드
                      </DownloadButton>
                    </FileInfoRow>
                  </FileItem>
                ))}
              </FilesList>
            </FilesContainer>
          )}
        </Section>

        {/* 2. 제출물 섹션 - 제출 상태에 따라 다른 UI */}
        <Section>
          <SectionTitle>제출물</SectionTitle>
          
          {/* 상태: 미제출(NOTSUBMITTED) - 제출 폼 표시 */}
          {assignment.submissionStatus === 'NOTSUBMITTED' && (
            <SubmissionForm>
              {/* 제출물 내용 입력 영역 */}
              <TextArea 
                placeholder="제출 내용을 입력하세요"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              
              {/* 파일 선택 영역 */}
              <FileInputArea>
                <FileLabel>
                  <FileInput
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png"
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
              <ButtonContainer>
                <SubmitButton 
                  onClick={handleSubmit} 
                  disabled={isLoading || !file}
                >
                  {isLoading ? '제출 중...' : '제출'}
                </SubmitButton>
                <CancelButton onClick={handleBack}>취소</CancelButton>
              </ButtonContainer>
              
              {/* 에러 메시지 */}
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </SubmissionForm>
          )}
          
          {/* 상태: 제출 완료(SUBMITTED) - 제출한 내용 표시 */}
          {assignment.submissionStatus === 'SUBMITTED' && (
            <SubmissionInfo>
              {/* 제출 정보 헤더 */}
              <SubmissionHeader>
                <SubmissionStatus>채점 대기중</SubmissionStatus>
              </SubmissionHeader>
              
              {/* 제출한 파일 목록 */}
              {assignment.submissionFiles && assignment.submissionFiles.length > 0 ? (
                <FilesList>
                  {assignment.submissionFiles.map((file, index) => (
                    <FileItem key={index}>
                      <FileInfoRow>
                        <FileIcon>{getFileIcon(file.fileName)}</FileIcon>
                        <FileDetails>
                          <FileName>{file.fileName}</FileName>
                        </FileDetails>
                        <DownloadButton 
                          onClick={() => downloadFile(file.fileUrl, file.fileName)}
                        >
                          다운로드
                        </DownloadButton>
                      </FileInfoRow>
                    </FileItem>
                  ))}
                </FilesList>
              ) : (
                <NoFiles>첨부 파일이 없습니다.</NoFiles>
              )}
              
              {/* 제출한 내용 */}
              {assignment.submissionContent && (
                <SubmissionContent>
                  {assignment.submissionContent}
                </SubmissionContent>
              )}
            </SubmissionInfo>
          )}
          
          {/* 상태: 채점 완료(SCORED) - 채점 결과 표시 */}
          {assignment.submissionStatus === 'SCORED' && (
            <SubmissionInfo>
              {/* 제출 정보 헤더 */}
              <SubmissionHeader>
                <ScoreDisplay>{assignment.submissionScore}/{assignment.assignmentMaxPoint}</ScoreDisplay>
              </SubmissionHeader>
              
              {/* 제출한 파일 목록 */}
              {assignment.submissionFiles && assignment.submissionFiles.length > 0 ? (
                <FilesList>
                  {assignment.submissionFiles.map((file, index) => (
                    <FileItem key={index}>
                      <FileInfoRow>
                        <FileIcon>{getFileIcon(file.fileName)}</FileIcon>
                        <FileDetails>
                          <FileName>{file.fileName}</FileName>
                        </FileDetails>
                        <DownloadButton 
                          onClick={() => downloadFile(file.fileUrl, file.fileName)}
                        >
                          다운로드
                        </DownloadButton>
                      </FileInfoRow>
                    </FileItem>
                  ))}
                </FilesList>
              ) : (
                <NoFiles>첨부 파일이 없습니다.</NoFiles>
              )}
              
              {/* 제출한 내용 */}
              {assignment.submissionContent && (
                <SubmissionContent>
                  {assignment.submissionContent}
                </SubmissionContent>
              )}
              
              {/* 교수자 피드백 */}
              {assignment.submissionComment && (
                <FeedbackSection>
                  <FeedbackTitle>피드백</FeedbackTitle>
                  <FeedbackContent>{assignment.submissionComment}</FeedbackContent>
                </FeedbackSection>
              )}
            </SubmissionInfo>
          )}
        </Section>
      </Content>
    </Container>
  );
};

// 스타일 컴포넌트
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

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DueDate = styled.div`
  color: #666;
  font-size: 14px;
`;

const PointDisplay = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #dc3545;
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
  margin-bottom: 24px;
`;

const FilesContainer = styled.div`
  margin-top: 16px;
`;

const FilesTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileItem = styled.div`
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
`;

const SubmissionForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 16px;
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #f1aeb5;
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

const SubmissionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SubmissionStatus = styled.div`
  color: #6c757d;
  font-weight: bold;
`;

const ScoreDisplay = styled.div`
  color: #dc3545;
  font-size: 18px;
  font-weight: bold;
`;

const SubmissionContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 16px;
`;

const FeedbackSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #28a745;
`;

const FeedbackTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #28a745;
`;

const FeedbackContent = styled.p`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const NoFiles = styled.div`
  color: #6c757d;
  font-style: italic;
  padding: 16px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
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
`;

const FileIcon = styled.span`
  font-size: 24px;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  word-break: break-all;
`;

const DownloadButton = styled.button`
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

export default AssignmentDetail; 