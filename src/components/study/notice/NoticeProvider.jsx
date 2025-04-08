import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { noticeService } from "../../../services/api";
import { useParams } from "react-router-dom";

const NoticeContext = createContext();

export const useNotice = () => useContext(NoticeContext);

export function NoticeProvider({ children }) {
  const { studyId } = useParams();
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [memberRole, setMemberRole] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false); // 초기 로드 완료 상태

  // 공지사항 목록 불러오기 (memberRole 정보도 함께 가져옴)
  const getNotices = useCallback(async (studyId) => {
    if (!studyId) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log("[NoticeProvider] 공지사항 목록 요청:", studyId);
      const response = await noticeService.getNotices(studyId);

      // memberContext에서 역할 정보 추출
      if (response.memberContext && response.memberContext.memberRole) {
        console.log(
          "[NoticeProvider] 역할 정보 설정:",
          response.memberContext.memberRole
        );
        setMemberRole(response.memberContext.memberRole);
      }

      if (response.success) {
        const sortedNotices = [...(response.data || [])].sort(
          (a, b) => new Date(b.noticeCreatedAt) - new Date(a.noticeCreatedAt)
        );
        setNotices(sortedNotices);
      } else {
        setError(
          response.message || "공지사항 목록을 불러오는데 실패했습니다."
        );
        setNotices([]);
      }
    } catch (err) {
      console.error("[NoticeProvider] 공지사항 목록 조회 실패:", err);
      setError(err.message || "공지사항 목록을 불러오는데 실패했습니다.");
      setNotices([]);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true); // 로드 완료 표시
    }
  }, []);

  // 컴포넌트 마운트 시 한 번만 공지사항 목록 가져오기
  useEffect(() => {
    if (studyId && !initialLoadDone) {
      getNotices(studyId);
    }
  }, [studyId, initialLoadDone]);

  // 공지사항 상세보기
  const getNoticeById = useCallback(async (studyId, noticeId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await noticeService.getNoticeById(studyId, noticeId);

      if (response.memberContext && response.memberContext.memberRole) {
        setMemberRole(response.memberContext.memberRole);
      }

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
        // 성공시 목록에 새 공지사항 추가 후 최신 생성일자 기준으로 정렬
        if (response.data) {
          setNotices((prev) => {
            // 새 공지사항 추가
            const updatedNotices = [response.data, ...prev];

            return updatedNotices.sort(
              (a, b) =>
                new Date(b.noticeCreatedAt) - new Date(a.noticeCreatedAt)
            );
          });
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
          // 수정된 공지사항으로 상태 업데이트 후 생성일자 기준으로 정렬
          setNotices((prev) => {
            // 먼저 해당 공지사항 업데이트
            const updatedNotices = prev.map((notice) =>
              notice.noticeId === noticeId
                ? {
                    ...notice,
                    ...noticeData,
                  }
                : notice
            );

            // 생성일자 기준으로 내림차순 정렬 (최신순)
            return updatedNotices.sort(
              (a, b) =>
                new Date(b.noticeCreatedAt) - new Date(a.noticeCreatedAt)
            );
          });
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
        memberRole, // 역할 정보 제공
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
