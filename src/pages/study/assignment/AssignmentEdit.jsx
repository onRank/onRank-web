import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import FileUploader from "../../../components/common/FileUploader";
import Button from "../../../components/common/Button";
import "./AssignmentStyles.css";

function AssignmentEdit() {
  const { studyId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useStudyRole();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    assignmentTitle: "",
    assignmentContent: "",
    assignmentDueDate: "",
    assignmentMaxPoint: 100,
    remainingFileIds: [],
    newFileNames: [],
  });

  // 첨부 파일 상태
  const [attachedFiles, setAttachedFiles] = useState([]);
  // 기존 파일 상태
  const [existingFiles, setExistingFiles] = useState([]);

  // 권한 체크 - 관리자만 접근 가능
  useEffect(() => {
    if (!isManager) {
      alert("과제 수정 권한이 없습니다.");
      navigate(`/studies/${studyId}/assignments`);
    }
  }, [isManager, studyId, navigate]);

  // 과제 데이터 불러오기
  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!studyId || !assignmentId) {
        console.error("[AssignmentEdit] studyId 또는 assignmentId가 없음:", {
          studyId,
          assignmentId,
        });
        return;
      }

      setIsFetching(true);
      setError(null);

      try {
        console.log(
          `[AssignmentEdit] 과제 데이터 조회 시작: studyId=${studyId}, assignmentId=${assignmentId}`
        );
        const response = await assignmentService.getAssignmentForEdit(
          studyId,
          assignmentId
        );
        console.log(`[AssignmentEdit] 과제 데이터 조회 성공:`, response);

        // 날짜 처리 안전하게 수정
        let dueDateString = "";
        try {
          if (response.data.assignmentDueDate) {
            const dueDate = new Date(response.data.assignmentDueDate);
            if (!isNaN(dueDate.getTime())) {
              dueDateString = dueDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM" 형식으로 잘라냄
            } else {
              console.warn(
                "[AssignmentEdit] 유효하지 않은 날짜 형식:",
                response.data.assignmentDueDate
              );
            }
          }
        } catch (dateError) {
          console.error("[AssignmentEdit] 날짜 변환 오류:", dateError);
        }

        // 기존 파일에서 ID 추출하여 remainingFileIds 설정
        const fileIds =
          response.data.assignmentFiles?.map((file) => file.fileId) || [];

        setFormData({
          assignmentTitle: response.data.assignmentTitle || "",
          assignmentContent: response.data.assignmentContent || "",
          assignmentDueDate: dueDateString,
          assignmentMaxPoint: response.data.assignmentMaxPoint || 100,
          remainingFileIds: fileIds,
          newFileNames: [],
        });

        // 기존 파일 설정
        if (
          response.data.assignmentFiles &&
          response.data.assignmentFiles.length > 0
        ) {
          setExistingFiles(response.data.assignmentFiles);
        }
      } catch (err) {
        console.error("[AssignmentEdit] 과제 조회 실패:", err);
        setError("과제 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchAssignmentData();
  }, [studyId, assignmentId]);

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }));
  };

  // 새로 첨부된 파일 처리
  const handleFileSelect = (files) => {
    setAttachedFiles(files);
    setFormData((prev) => ({
      ...prev,
      newFileNames: files.map((file) => file.name),
    }));
  };

  // 기존 파일 삭제 처리
  const handleExistingFileRemove = (fileId) => {
    setExistingFiles((prev) => prev.filter((file) => file.fileId !== fileId));
    setFormData((prev) => ({
      ...prev,
      remainingFileIds: prev.remainingFileIds.filter((id) => id !== fileId),
    }));
  };

  // 과제 수정 제출 처리
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

      // FormData 객체 생성
      const formDataObj = new FormData();
      formDataObj.append("assignmentTitle", formData.assignmentTitle);
      formDataObj.append("assignmentContent", formData.assignmentContent);

      // 날짜 안전하게 변환
      try {
        const dueDate = new Date(formData.assignmentDueDate);
        if (!isNaN(dueDate.getTime())) {
          formDataObj.append("assignmentDueDate", dueDate.toISOString());
        } else {
          throw new Error("유효하지 않은 날짜 형식입니다.");
        }
      } catch (dateError) {
        console.error("[AssignmentEdit] 날짜 변환 오류:", dateError);
        setError("날짜 형식이 올바르지 않습니다. 다시 선택해주세요.");
        setIsLoading(false);
        return;
      }

      formDataObj.append("assignmentMaxPoint", formData.assignmentMaxPoint);

      // 남길 기존 파일 ID 추가 (각각 별도의 remainingFileIds 파라미터로)
      formData.remainingFileIds.forEach((fileId) => {
        formDataObj.append("remainingFileIds", fileId);
      });

      // 새 파일 이름 추가 (각각 별도의 newFileNames 파라미터로)
      formData.newFileNames.forEach((fileName) => {
        formDataObj.append("newFileNames", fileName);
      });

      // 새 파일 추가
      attachedFiles.forEach((file) => {
        formDataObj.append("files", file);
      });

      console.log("[AssignmentEdit] 남길 파일 ID:", formData.remainingFileIds);
      console.log(
        "[AssignmentEdit] 새로 첨부된 파일:",
        attachedFiles.map((f) => f.name)
      );
      console.log("[AssignmentEdit] 새 파일 이름 목록:", formData.newFileNames);

      // 과제 수정 API 호출
      await assignmentService.updateAssignment(
        studyId,
        assignmentId,
        formDataObj
      );

      alert("과제가 성공적으로 수정되었습니다.");
      navigate(`/studies/${studyId}/assignments`); // 목록 페이지로 이동
    } catch (err) {
      console.error("과제 수정 실패:", err);
      setError(
        `과제 수정에 실패했습니다: ${
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

  if (isFetching) {
    return <div className="loading-message">과제 정보를 불러오는 중...</div>;
  }

  return (
    <div className="assignment-page">
      <h1 className="page-title">과제 수정</h1>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-field">
          <label htmlFor="assignmentTitle">
            <span style={{ color: "#ee0418", marginRight: "4px" }}>*</span>과제
            제목
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
            <span style={{ color: "#ee0418", marginRight: "4px" }}>*</span>마감
            기한
          </label>
          <input
            id="assignmentDueDate"
            name="assignmentDueDate"
            type="datetime-local"
            value={formData.assignmentDueDate}
            onChange={handleChange}
            required
          />
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
            value={formData.assignmentMaxPoint}
            onChange={handleChange}
          />
        </div>

        {/* 통합 FileUploader 컴포넌트 사용 */}
        <div className="form-field">
          <FileUploader
            existingFiles={existingFiles.map((file) => ({
              fileId: file.fileId,
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              fileSize: file.fileSize,
            }))}
            onFileSelect={handleFileSelect}
            onExistingFileRemove={handleExistingFileRemove}
          />
        </div>

        <div className="button-container">
          <Button variant="submit" type="submit" disabled={isLoading} />
          <Button variant="back" onClick={handleCancel} type="button" />
        </div>
      </form>
    </div>
  );
}

export default AssignmentEdit;
