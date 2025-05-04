import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import assignmentService from "../../../services/assignment";
import {
  formatFileSize,
  getFileIcon,
  downloadFile,
  uploadFileToS3,
  extractUploadUrlFromResponse,
  handleFileUploadWithS3,
  isImageFile,
  getFilePreviewUrl,
} from "../../../utils/fileUtils";

const AssignmentDetail = () => {
  const { studyId, assignmentId } = useParams();
  console.log("[AssignmentDetail] URL 파라미터:", { studyId, assignmentId });
  
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [memberContext, setMemberContext] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [submissionContent, setSubmissionContent] = useState("");

  // 재제출 모드 상태
  const [isResubmitting, setIsResubmitting] = useState(false);

  // 업로드 진행 상태 추적
  const [uploadStatus, setUploadStatus] = useState([]);

  const MAX_CHAR_COUNT = 10000;

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!studyId || !assignmentId) {
        console.error("[AssignmentDetail] studyId 또는 assignmentId가 없음:", { studyId, assignmentId });
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log(`[AssignmentDetail] 과제 상세 정보 조회 시작: studyId=${studyId}, assignmentId=${assignmentId}`);

      try {
        const response = await assignmentService.getAssignmentById(
          studyId,
          assignmentId
        );
        console.log("[AssignmentDetail] 과제 상세 정보 조회 성공:", response);

        // API 응답 구조에 맞게 데이터 저장
        if (response.memberContext) {
          setMemberContext(response.memberContext);
        }

        // 과제 데이터는 response.data에 있음
        if (response.data) {
          // 데이터 검증 및 기본값 설정
          const assignmentData = {
            ...response.data,
            submissionStatus: response.data.submissionStatus || "NOTSUBMITTED",
            assignmentFiles: response.data.assignmentFiles || [],
            submissionFiles: response.data.submissionFiles || [],
            submissionContent: response.data.submissionContent || "",
            submissionScore: response.data.submissionScore || null,
            submissionComment: response.data.submissionComment || "",
          };

          setAssignment(assignmentData);
        } else {
          console.error("[AssignmentDetail] 과제 데이터가 없습니다:", response);
          setError("과제 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("[AssignmentDetail] 과제 상세 정보 조회 실패:", err);
        setError("과제 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [studyId, assignmentId]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles && selectedFiles.length > 0) {
      console.log(
        "파일 선택:",
        selectedFiles
          .map((file) => `${file.name} (${formatFileSize(file.size)})`)
          .join(", ")
      );
      setFiles(selectedFiles);
      setUploadProgress(0);
      setError(null);
      setUploadStatus([]);
    }
  };

  const handleSubmissionContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHAR_COUNT) {
      setSubmissionContent(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      setIsUploading(true);

      // 파일명 배열 생성
      const fileNames = files.map((file) => file.name);

      const formattedData = {
        submissionContent: submissionContent,
        fileNames: fileNames,
      };

      console.log("[AssignmentDetail] 제출 데이터:", formattedData);
      console.log("[AssignmentDetail] 첨부 파일:", files.map(f => `${f.name} (${formatFileSize(f.size)})`));

      // 서버에 과제 제출 정보 전송
      const response = await assignmentService.submitAssignment(
        studyId,
        assignmentId,
        formattedData
      );
      
      console.log("[AssignmentDetail] 제출 응답:", response);
      
      // 파일 업로드 처리 (createAssignment와 동일한 패턴)
      if (files.length > 0 && response) {
        console.log("[AssignmentDetail] 파일 업로드 시작, 파일 개수:", files.length);
        
        try {
          // 파일 업로드 상태 트래킹을 위한 초기 상태 설정
          setUploadStatus(files.map(file => ({
            fileName: file.name,
            progress: 0,
            status: 'uploading'
          })));
          
          // handleFileUploadWithS3 함수 사용 - 여러 파일 한번에 처리
          const uploadResults = await handleFileUploadWithS3(response, files, 'uploadUrl');
          console.log("[AssignmentDetail] 파일 업로드 결과:", uploadResults);
          
          // 업로드 실패 발생 시 경고
          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn("[AssignmentDetail] 일부 파일 업로드 실패:", failedUploads);
            setError("일부 파일 업로드에 실패했습니다. 다시 시도해 주세요.");
            return; // 성공 메시지 표시하지 않음
          }
          
          // 모든 파일 업로드 성공 시 상태 업데이트
          setUploadStatus(files.map(file => ({
            fileName: file.name,
            progress: 100,
            status: 'success'
          })));
        } catch (uploadErr) {
          console.error("[AssignmentDetail] 파일 업로드 중 오류:", uploadErr);
          setError(`파일 업로드 중 오류가 발생했습니다: ${uploadErr.message || '알 수 없는 오류'}`);
          return; // 성공 메시지 표시하지 않음
        }
      }

      alert("과제가 성공적으로 제출되었습니다.");
      navigate(`/studies/${studyId}/assignment`);
    } catch (err) {
      console.error("[AssignmentDetail] 과제 제출 실패:", err);
      setError(
        `과제 제출에 실패했습니다: ${
          err.message || "알 수 없는 오류가 발생했습니다."
        }`
      );
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate(`/studies/${studyId}/assignment`);
  };

  // 재제출 모드 활성화
  const handleResubmit = () => {
    setIsResubmitting(true);
    setFiles([]);
    setSubmissionContent("");
    setCharCount(0);
    setUploadStatus([]);
  };

  // 재제출 취소
  const handleCancelResubmit = () => {
    setIsResubmitting(false);
    setFiles([]);
    setSubmissionContent("");
    setCharCount(0);
    setUploadStatus([]);
  };

  // 파일 업로드 상태 확인
  const getUploadStatusForFile = (fileName) => {
    return (
      uploadStatus.find((item) => item.fileName === fileName) || {
        progress: 0,
        status: "pending",
      }
    );
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

  // 일자 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";

    try {
      const date = new Date(dateString);

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return "날짜 형식 오류";
      }

      return `${date.getFullYear()}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("날짜 변환 오류:", error);
      return "날짜 변환 오류";
    }
  };

  // 제출 폼 렌더링 함수
  const renderSubmissionForm = () => (
    <>
      {/* 제출물 입력 영역 */}
      <TextareaSection>
        <TextArea
          placeholder="제출물 내용을 입력하세요."
          value={submissionContent}
          onChange={handleSubmissionContentChange}
          maxLength={MAX_CHAR_COUNT}
        />
        <CharCounter>
          {charCount}/{MAX_CHAR_COUNT}
        </CharCounter>
      </TextareaSection>

      {/* 파일 첨부 영역 */}
      <AttachmentSection>
        <SectionSubtitle>첨부파일</SectionSubtitle>
        <FileUploadContainer>
          {files.length > 0 ? (
            <FileList>
              {files.map((file, index) => {
                const fileStatus = getUploadStatusForFile(file.name);
                return (
                  <FileItem key={index} status={fileStatus.status}>
                    <FileIcon>{getFileIcon(file.name)}</FileIcon>
                    <FileInfo>
                      <FileName>{file.name}</FileName>
                      <FileInfoRow>
                        <FileSize>{formatFileSize(file.size)}</FileSize>
                        {fileStatus.status === "uploading" &&
                          fileStatus.progress > 0 && (
                            <FileUploadProgress>
                              <FileProgressBar width={fileStatus.progress} />
                            </FileUploadProgress>
                          )}
                        {fileStatus.status === "error" && (
                          <FileErrorMessage>
                            {fileStatus.message}
                          </FileErrorMessage>
                        )}
                      </FileInfoRow>
                    </FileInfo>
                    <DeleteButton
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== index))
                      }
                      disabled={isUploading}
                    >
                      ✕
                    </DeleteButton>
                    {isImageFile(file) && (
                      <PreviewIconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          const previewUrl = URL.createObjectURL(file);
                          window.open(previewUrl);
                        }}
                        title="이미지 미리보기"
                      >
                        👁️
                      </PreviewIconButton>
                    )}
                  </FileItem>
                );
              })}
            </FileList>
          ) : (
            <FileUploadBox>
              <FileInputLabel>
                <FileInput
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  disabled={isUploading}
                />
                <UploadIcon>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 18V6"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 11L12 6L17 11"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 18H4"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </UploadIcon>
                <UploadText>
                  파일을 클릭하여 추가하거나
                  <br />
                  여기에 드래그하세요
                </UploadText>
              </FileInputLabel>
            </FileUploadBox>
          )}

          {files.length > 0 && (
            <AddMoreFilesButton>
              <FileInputLabel>
                <FileInput
                  type="file"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files);
                    setFiles([...files, ...newFiles]);
                  }}
                  multiple
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  disabled={isUploading}
                />
                + 파일 추가
              </FileInputLabel>
            </AddMoreFilesButton>
          )}
        </FileUploadContainer>

        {/* 전체 업로드 진행률 */}
        {isUploading && (
          <ProgressContainer>
            <ProgressBar width={uploadProgress} />
            <ProgressText>{uploadProgress}% 업로드 중...</ProgressText>
          </ProgressContainer>
        )}
      </AttachmentSection>

      {/* 에러 메시지 */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* 버튼 영역 */}
      <ButtonsRow>
        <SubmitButton
          onClick={handleSubmit}
          disabled={
            isLoading || (files.length === 0 && submissionContent.trim() === "")
          }
        >
          {isLoading ? "제출 중..." : "제출"}
        </SubmitButton>
        <CancelButton
          onClick={isResubmitting ? handleCancelResubmit : handleBack}
        >
          취소
        </CancelButton>
      </ButtonsRow>
    </>
  );

  // 페이지 타이틀 결정
  const getPageTitle = () => {
    if (isResubmitting) return "다시 제출";

    switch (assignment.submissionStatus) {
      case "NOTSUBMITTED":
        return "미제출";
      case "SUBMITTED":
        return "제출완료";
      case "SCORED":
        return "채점완료";
      default:
        return "";
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>← 목록으로</BackButton>
        <Title>{assignment.assignmentTitle}</Title>
        <MetaInfo>
          <StatusAndDueDate>
            <PageStatus>{getPageTitle()}</PageStatus>
            <DueDate>마감: {formatDate(assignment.assignmentDueDate)}</DueDate>
          </StatusAndDueDate>
          {assignment.submissionStatus === "SCORED" ? (
            <ScoreDisplay>
              {assignment.submissionScore}/{assignment.assignmentMaxPoint} pt
            </ScoreDisplay>
          ) : (
            <PointDisplay>--/{assignment.assignmentMaxPoint} pt</PointDisplay>
          )}
        </MetaInfo>
      </Header>

      <Content>
        {/* 1. 지시사항 섹션 */}
        <Section>
          <SectionTitle>지시사항</SectionTitle>
          <Description>{assignment.assignmentContent}</Description>

          {/* 첨부 파일 목록 (assignmentFiles) */}
          {assignment.assignmentFiles &&
            assignment.assignmentFiles.length > 0 && (
              <FilesContainer>
                <SectionSubtitle>첨부파일</SectionSubtitle>
                <FilesList>
                  {assignment.assignmentFiles.map((file, index) => (
                    <FileDownloadItem key={index}>
                      <FileInfoRow>
                        <FileIcon>{getFileIcon(file.fileName)}</FileIcon>
                        <FileDetails>
                          <FileName>{file.fileName}</FileName>
                        </FileDetails>
                        {isImageFile(file.fileName) && file.fileUrl && (
                          <PreviewButton 
                            onClick={() => window.open(file.fileUrl, '_blank')}
                            title="이미지 미리보기"
                          >
                            미리보기
                          </PreviewButton>
                        )}
                        <DownloadButton
                          onClick={() =>
                            downloadFile(file.fileUrl, file.fileName)
                          }
                        >
                          다운로드
                        </DownloadButton>
                      </FileInfoRow>
                      {isImageFile(file.fileName) && file.fileUrl && (
                        <ImagePreviewContainer>
                          <ImagePreview src={file.fileUrl} alt={file.fileName} />
                        </ImagePreviewContainer>
                      )}
                    </FileDownloadItem>
                  ))}
                </FilesList>
              </FilesContainer>
            )}
        </Section>

        {/* 2. 제출물 섹션 - 상태에 따라 다른 UI */}
        <Section>
          {isResubmitting ? (
            <>
              <SectionTitle>제출물</SectionTitle>
              {renderSubmissionForm()}
            </>
          ) : assignment.submissionStatus === "NOTSUBMITTED" ? (
            <>
              <SectionTitle>제출물</SectionTitle>
              {renderSubmissionForm()}
            </>
          ) : assignment.submissionStatus === "SUBMITTED" ? (
            <>
              <SectionTitle>제출물</SectionTitle>
              <SubmissionRow>
                <SubmissionLabel>
                  제출: {formatDate(assignment.submissionDate)}
                </SubmissionLabel>
              </SubmissionRow>

              <ButtonsRow>
                <ResubmitButton onClick={handleResubmit}>
                  다시 제출
                </ResubmitButton>
              </ButtonsRow>
            </>
          ) : (
            assignment.submissionStatus === "SCORED" && (
              <>
                <SectionTitle>제출물</SectionTitle>
                <SubmissionRow>
                  <SubmissionLabel>
                    제출: {formatDate(assignment.submissionDate)}
                  </SubmissionLabel>
                </SubmissionRow>

                {/* 피드백 섹션 */}
                <FeedbackSection>
                  <SectionSubtitle>코멘트</SectionSubtitle>
                  <FeedbackContent>
                    {assignment.submissionComment || "코멘트가 없습니다."}
                  </FeedbackContent>
                </FeedbackSection>

                <ButtonsRow>
                  <ResubmitButton onClick={handleResubmit}>
                    다시 제출
                  </ResubmitButton>
                </ButtonsRow>
              </>
            )
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

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusAndDueDate = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PageStatus = styled.div`
  font-size: 14px;
  color: #666;
`;

const DueDate = styled.div`
  color: #666;
  font-size: 14px;
`;

const PointDisplay = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #666;
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

const SectionSubtitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const Description = styled.p`
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const FilesContainer = styled.div`
  margin-top: 16px;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileDownloadItem = styled.div`
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
`;

const TextareaSection = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
`;

const CharCounter = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: #666;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
`;

const AttachmentSection = styled.div`
  margin-bottom: 20px;
`;

const FileUploadContainer = styled.div`
  margin-top: 10px;
`;

const FileUploadBox = styled.div`
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  cursor: pointer;

  &:hover {
    border-color: #adb5bd;
    background-color: #f1f3f5;
  }
`;

const FileInputLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  color: #6c757d;
`;

const UploadIcon = styled.div`
  margin-bottom: 10px;
`;

const UploadText = styled.div`
  text-align: center;
  line-height: 1.4;
`;

const FileInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;

  ${(props) =>
    props.status === "error" &&
    `
    border-color: #dc3545;
    background-color: #f8d7da;
  `}

  ${(props) =>
    props.status === "success" &&
    `
    border-color: #28a745;
    background-color: #d4edda;
  `}
`;

const FileIcon = styled.div`
  font-size: 24px;
`;

const FileInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const FileName = styled.div`
  font-weight: 500;
  word-break: break-all;
`;

const FileInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const FileUploadProgress = styled.div`
  flex: 1;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const FileProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.width}%;
  background-color: #007bff;
  transition: width 0.3s ease;
`;

const FileErrorMessage = styled.div`
  font-size: 12px;
  color: #dc3545;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;

  &:hover {
    color: #bd2130;
  }

  &:disabled {
    color: #dee2e6;
    cursor: not-allowed;
  }
`;

const AddMoreFilesButton = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
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
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ResubmitButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #c82333;
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e9ecef;
  }
`;

const ScoreDisplay = styled.div`
  color: white;
  font-size: 14px;
  font-weight: bold;
  background-color: #dc3545;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
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
  margin-top: 16px;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 4px;
  position: relative;
  height: 20px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.width}%;
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

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
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

const SubmissionRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
`;

const SubmissionLabel = styled.div`
  color: #6c757d;
  font-size: 14px;
`;

const FeedbackSection = styled.div`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const FeedbackContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 12px;
  text-align: center;
  max-height: 200px;
  overflow: hidden;
  border-radius: 4px;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
`;

const PreviewButton = styled.button`
  padding: 6px 12px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  white-space: nowrap;
  margin-right: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #138496;
  }
`;

const PreviewIconButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
  
  &:hover {
    opacity: 0.7;
  }
`;

export default AssignmentDetail;
