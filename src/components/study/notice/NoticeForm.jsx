import { useState, useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";

const NoticeForm = ({ studyId, notice = null, mode = "create", onFinish }) => {
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoading, createNotice, editNotice } = useNotice();

  useEffect(() => {
    if (notice) {
      setNoticeTitle(notice.noticeTitle);
      setNoticeContent(notice.noticeContent);

      // 기존 파일이 있으면 설정
      if (notice.files && Array.isArray(notice.files)) {
        setExistingFiles(notice.files);
      }
    }
  }, [notice]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인 (새로 추가하는 파일)
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 기존 파일과 이름 중복 확인 (수정 모드에서)
    const duplicateWithExisting = newFiles.filter((file) =>
      existingFiles.some((f) => f.fileName === file.name)
    );

    if (duplicateWithExisting.length > 0) {
      setError(
        `이미 존재하는 파일이 있습니다: ${duplicateWithExisting
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // 파일 크기 제한 (10MB)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(
        `다음 파일이 10MB를 초과합니다: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    // 파일 선택 후 input 초기화
    e.target.value = "";
  };

  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleRemoveExistingFile = (fileId, fileName) => {
    setExistingFiles((prev) => prev.filter((file) => file.fileId !== fileId));
    setFilesToRemove((prev) => [...prev, { fileId, fileName }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!noticeTitle.trim()) {
      setError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        // 생성 모드
        const newNotice = {
          noticeTitle,
          noticeContent,
          fileNames: selectedFiles.map((file) => file.name),
        };

        const result = await createNotice(studyId, newNotice, selectedFiles);
        if (!result.success) {
          setError(result.message || "공지사항 저장 중 오류가 발생했습니다.");
          return;
        }
        if (result.warning) {
          setError(result.warning);
        }
      } else {
        // 수정 모드
        const updatedNotice = {
          noticeTitle,
          noticeContent,
          fileNames: selectedFiles.map((file) => file.name),
          // 유지할 기존 파일 목록
          existingFileIds: existingFiles.map((file) => file.fileId),
          // 제거할 파일 목록
          removeFileIds: filesToRemove.map((file) => file.fileId),
        };

        const result = await editNotice(
          studyId,
          notice.noticeId,
          updatedNotice,
          selectedFiles
        );
        if (!result.success) {
          setError(result.message || "공지사항 수정 중 오류가 발생했습니다.");
          return;
        }
        if (result.warning) {
          setError(result.warning);
        }
      }
      onFinish?.(); // 전송 후 콜백 (예: 목록으로 이동)
    } catch (error) {
      setError(
        "공지사항 처리 중 오류 발생: " + (error.message || "알 수 없는 오류")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          제목
        </label>
        <input
          id="title"
          className="w-full p-2 border rounded"
          placeholder="제목을 입력하세요"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          내용
        </label>
        <textarea
          id="content"
          className="w-full p-2 border rounded h-40"
          placeholder="내용을 입력하세요"
          value={noticeContent}
          onChange={(e) => setNoticeContent(e.target.value)}
        />
      </div>

      {/* 파일 업로드 영역 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          파일 첨부
        </label>
        <div className="flex items-center">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded border border-blue-300 hover:bg-blue-100">
              파일 선택
            </div>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="ml-3 text-sm text-gray-500">
            10MB 이하 파일만 업로드 가능합니다.
          </span>
        </div>

        {/* 기존 첨부 파일 목록 (수정 모드) */}
        {mode === "edit" && existingFiles.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              기존 첨부 파일
            </h4>
            <ul className="border rounded divide-y">
              {existingFiles.map((file) => (
                <li
                  key={file.fileId}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="truncate max-w-xs">{file.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveExistingFile(file.fileId, file.fileName)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 새로 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {mode === "edit" ? "추가할 파일" : "선택된 파일"}
            </h4>
            <ul className="border rounded divide-y">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="truncate max-w-xs">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6 space-x-3">
        <Button
          type="submit"
          variant="upload"
          label={mode === "create" ? "등록하기" : "수정하기"}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default NoticeForm;
