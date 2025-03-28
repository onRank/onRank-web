import PropTypes from "prop-types";
import { createContext, useContext, useState, useCallback } from "react";
import { noticeService } from "../../../services/api";

// Context 생성
const NoticeContext = createContext();

// Context를 사용하기 위한 커스텀 훅
export const useNotice = () => useContext(NoticeContext);

// Provider 컴포넌트
export function NoticeProvider({ children }) {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 공지사항 목록 불러오기
  const getNotices = useCallback(async (studyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await noticeService.getNotices(studyId);
      if (response.success) {
        setNotices(response.data || []);
      } else {
        setError(
          response.message || "공지사항 목록을 불러오는데 실패했습니다."
        );
        setNotices([]);
      }
    } catch (err) {
      console.error("공지사항 목록 조회 실패:", err);
      setError(err.message || "공지사항 목록을 불러오는데 실패했습니다.");
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 공지사항 상세보기
  const getNoticeById = useCallback(async (studyId, noticeId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await noticeService.getNoticeById(studyId, noticeId);
      if (response.success) {
        setSelectedNotice(response.data);
      } else {
        setError(response.message || "공지사항을 불러오는데 실패했습니다.");
        setSelectedNotice(null);
      }
    } catch (err) {
      console.error("공지사항 상세 조회 실패:", err);
      setError(err.message || "공지사항을 불러오는데 실패했습니다.");
      setSelectedNotice(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 공지사항 생성
  const createNotice = useCallback(async (studyId, newNotice, files = []) => {
    setIsLoading(true);
    try {
      const response = await noticeService.createNotice(
        studyId,
        newNotice,
        files
      );
      if (response.success) {
        // 성공시 목록에 새 공지사항 추가
        if (response.data) {
          setNotices((prev) => [response.data, ...prev]);
        }
        return response; // 경고 메시지 등을 포함하기 위해 전체 응답 반환
      } else {
        throw new Error(response.message || "공지사항 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("공지사항 등록 실패:", err);
      return {
        success: false,
        message: err.message || "공지사항 등록에 실패했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 공지사항 수정
  const editNotice = useCallback(
    async (studyId, noticeId, noticeData, files = []) => {
      setIsLoading(true);
      try {
        const response = await noticeService.editNotice(
          studyId,
          noticeId,
          noticeData,
          files
        );
        if (response.success) {
          // 수정된 공지사항으로 상태 업데이트
          setNotices((prev) =>
            prev.map((notice) =>
              notice.noticeId === noticeId
                ? { ...notice, ...noticeData }
                : notice
            )
          );
          return response; // 경고 메시지 등을 포함하기 위해 전체 응답 반환
        } else {
          throw new Error(response.message || "공지사항 수정에 실패했습니다.");
        }
      } catch (err) {
        console.error("공지사항 수정 실패:", err);
        return {
          success: false,
          message: err.message || "공지사항 수정에 실패했습니다.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 공지사항 삭제
  const deleteNotice = useCallback(async (studyId, noticeId) => {
    setIsLoading(true);
    try {
      const response = await noticeService.deleteNotice(studyId, noticeId);
      if (response.success) {
        // 삭제된 공지사항을 목록에서 제거
        setNotices((prev) =>
          prev.filter((notice) => notice.noticeId !== noticeId)
        );
        return { success: true };
      } else {
        throw new Error(response.message || "공지사항 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("공지사항 삭제 실패:", err);
      return {
        success: false,
        message: err.message || "공지사항 삭제에 실패했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <NoticeContext.Provider
      value={{
        notices,
        selectedNotice,
        isLoading,
        error,
        getNotices,
        getNoticeById,
        createNotice,
        editNotice,
        deleteNotice,
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
}

NoticeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
