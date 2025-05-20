import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import Button from "../../../components/common/Button";
import FileUploader from "../../../components/common/FileUploader";
import { formatFileSize, handleFileUploadWithS3 } from "../../../utils/fileUtils";
import "./AssignmentStyles.css";
import "../../../styles/notice.css";

function AssignmentCreate() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useStudyRole();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    assignmentTitle: "",
    assignmentContent: "",
    assignmentDueDate: "",
    assignmentMaxPoint: 100,
    fileNames: [],
  });

  // 첨부 파일 상태
  const [attachedFiles, setAttachedFiles] = useState([]);

  // 권한 체크 - 관리자만 접근 가능
  useEffect(() => {
    if (!isManager) {
      alert("과제 업로드 권한이 없습니다.");
      navigate(`/studies/${studyId}/assignments`);
    }
  }, [isManager, studyId, navigate]);

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // 포인트 제한 추가 - 1,000,000 이하만 허용
    if (name === 'assignmentMaxPoint') {
      const numValue = parseInt(value, 10);
      if (numValue > 1000000) {
        setError('최대 포인트는 1,000,000 이하여야 합니다.');
        return;
      } else {
        setError(null);
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }));
  };

  // 파일 첨부 처리
  const handleFileSelect = (files) => {
    setAttachedFiles(files);

    // 파일 이름 배열 업데이트
    setFormData((prev) => ({
      ...prev,
      fileNames: files.map((file) => file.name),
    }));
  };

  // 과제 업로드 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 입력값 검증
    if (!formData.assignmentTitle.trim()) {
      setError("과제 제목을 입력해주세요.");
      return;
    }

    if (!formData.assignmentContent.trim()) {
      setError("과제 내용을 입력해주세요.");
      return;
    }

    if (!formData.assignmentDueDate) {
      setError("제출 기한을 선택해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 디버깅 로그: 첨부된 파일 확인
      console.log("[AssignmentCreate] 첨부된 파일:", attachedFiles);
      console.log(
        "[AssignmentCreate] 첨부된 파일 목록:",
        attachedFiles.map((file) => `${file.name} (${file.size} bytes)`)
      );

      // 날짜 변환 - 로컬 시간대 보존
      const dueDate = new Date(formData.assignmentDueDate);
      // getTimezoneOffset()은 분 단위로 현지 시간과 UTC의 차이를 반환
      // UTC로 변환되는 것을 방지하기 위해 오프셋만큼 시간 조정
      const offsetMs = dueDate.getTimezoneOffset() * 60 * 1000;
      const localDate = new Date(dueDate.getTime() - offsetMs);
      const dueDateISO = localDate.toISOString();
      
      console.log("[AssignmentCreate] 원본 마감일:", formData.assignmentDueDate);
      console.log("[AssignmentCreate] 변환된 마감일:", dueDateISO);
      
      // 요청 데이터 구성 - JSON 형식으로 변경
      const assignmentData = {
        assignmentTitle: formData.assignmentTitle,
        assignmentContent: formData.assignmentContent,
        assignmentDueDate: dueDateISO,
        assignmentMaxPoint: formData.assignmentMaxPoint,
        fileNames: attachedFiles.map(file => file.name), // 파일 이름 배열만 전송
        files: attachedFiles, // 실제 파일 객체 추가
      };

      console.log("[AssignmentCreate] 과제 생성 요청 구성 완료:", assignmentData);

      // 과제 생성 API 호출 (JSON 형식 사용) - FormData 대신 JSON
      const response = await assignmentService.createAssignment(studyId, assignmentData);
      
      console.log("[AssignmentCreate] 과제 생성 응답:", response);

      // 파일이 있는 경우, 파일 업로드 처리
      if (attachedFiles.length > 0) {
        console.log("[AssignmentCreate] 파일 업로드 시작");
        
        try {
          // handleFileUploadWithS3 함수 사용하여 파일 업로드
          const uploadResults = await handleFileUploadWithS3(response, attachedFiles, "uploadUrl");
          
          console.log("[AssignmentCreate] 파일 업로드 결과:", uploadResults);
          
          // 업로드 실패 체크
          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn("[AssignmentCreate] 일부 파일 업로드 실패:", failedUploads);
            alert("과제는 생성되었으나, 일부 파일 업로드에 실패했습니다.");
          } else {
            alert("과제가 성공적으로 업로드되었습니다.");
          }
        } catch (uploadErr) {
          console.error("[AssignmentCreate] 파일 업로드 중 오류:", uploadErr);
          alert("과제는 생성되었으나, 파일 업로드 중 오류가 발생했습니다.");
        }
      } else {
        alert("과제가 성공적으로 업로드되었습니다.");
      }
      
      navigate(`/studies/${studyId}/assignments`); // 목록 페이지로 이동
    } catch (err) {
      console.error("[AssignmentCreate] 과제 업로드 실패:", err);
      setError(
        `과제 업로드에 실패했습니다: ${
          err.message || "알 수 없는 오류가 발생했습니다."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigate(`/studies/${studyId}/assignments`);
  };

  return (
    <div className="assignment-page">
      <h1 className="page-title">과제 추가</h1>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-field">
          <label htmlFor="assignmentTitle">
            <span style={{ color: "#ee0418", marginRight: "4px" }}>*</span>제목
          </label>
          <input
            id="assignmentTitle"
            name="assignmentTitle"
            value={formData.assignmentTitle}
            onChange={handleChange}
            placeholder="과제 제목을 입력하세요"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="assignmentContent">
            <span style={{ color: "#ee0418", marginRight: "4px" }}>*</span>
            지시사항
          </label>
          <textarea
            id="assignmentContent"
            name="assignmentContent"
            value={formData.assignmentContent}
            onChange={handleChange}
            placeholder="과제 내용과 지시사항을 입력하세요"
            rows={6}
            required
          />
          <div className="char-count">
            {formData.assignmentContent.length}/10000
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="assignmentDueDate">
            <span style={{ color: "#ee0418", marginRight: "4px" }}>*</span>
            마감기한
          </label>
          <div 
            className="date-picker-wrapper" 
            onClick={() => document.getElementById('assignmentDueDate').showPicker()}
            style={{ cursor: 'pointer' }}
          >
            <input
              id="assignmentDueDate"
              name="assignmentDueDate"
              type="datetime-local"
              value={formData.assignmentDueDate}
              onChange={handleChange}
              required
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="assignmentMaxPoint">
            <span style={{ color: "#ee0418", marginRight: "4px" }}>*</span>최대
            포인트
          </label>
          <input
            id="assignmentMaxPoint"
            name="assignmentMaxPoint"
            type="number"
            min="0"
            max="1000000"
            value={formData.assignmentMaxPoint}
            onChange={handleChange}
          />
        </div>

        {/* 파일 업로더 컴포넌트 사용 */}
        <div className="form-field">
          <FileUploader existingFiles={[]} onFileSelect={handleFileSelect} />
        </div>

        <div className="buttons-row">
          <Button variant="upload" type="submit" disabled={isLoading} />
          <Button variant="back" type="button" onClick={handleCancel} />
        </div>
      </form>
    </div>
  );
}

export default AssignmentCreate;
 