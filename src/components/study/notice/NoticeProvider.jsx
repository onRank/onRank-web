import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { noticeService } from "../../../services/notice";
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
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // 공지사항 목록 불러오기
  const getNotices = useCallback(async (studyId) => {
    if (!studyId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log("[NoticeProvider] 공지사항 목록 요청:", studyId);
      const response = await noticeService.getNotices(studyId);

      // memberContext에서 역할 정보 추출
      if (response && typeof response === "object") {
        if (response.memberContext && response.memberContext.memberRole) {
          setMemberRole(response.memberContext.memberRole);
        } else {
          // 역할 정보가 없을 경우 기본값 설정
          setMemberRole("PARTICIPANT");
        }
      }

      if (response.success) {
        // 최신순 정렬 유지
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
      setInitialLoadDone(true);
    }
  }, []);

  // 컴포넌트 마운트 시 한 번만 공지사항 목록 가져오기
  useEffect(() => {
    if (studyId && !initialLoadDone) {
      getNotices(studyId);
    }
  }, [studyId, initialLoadDone, getNotices]);

  // 공지사항 상세보기
  const getNoticeById = useCallback(
    async (studyId, noticeId) => {
      if (!studyId || !noticeId) return;
      noticeId = parseInt(noticeId, 10);

      // 현재 선택된 공지사항이 이미 같은 것인지 확인
      if (selectedNotice && selectedNotice.noticeId === noticeId) {
        console.log("[NoticeProvider] 이미 선택된 공지사항과 동일함");
        return;
      }

      // 목록에서 기본 정보를 먼저 표시 (빠른 UI 반응을 위해)
      const noticeFromList = notices.find(
        (notice) => notice.noticeId === noticeId
      );
      if (noticeFromList) {
        console.log("[NoticeProvider] 목록에서 공지사항 기본 정보 사용");
        setSelectedNotice(noticeFromList);
      }

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
          if (!noticeFromList) setSelectedNotice(null);
        }
      } catch (err) {
        console.error("[NoticeProvider] 공지사항 상세 조회 실패:", err);
        setError(err.message || "공지사항을 불러오는데 실패했습니다.");
        if (!noticeFromList) setSelectedNotice(null);
      } finally {
        setIsLoading(false);
      }
    },
    [notices, selectedNotice]
  );

  // 공지사항 생성
  const createNotice = useCallback(async (studyId, noticeData, files = []) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[NoticeProvider] 공지사항 생성 요청:", noticeData);
      const response = await noticeService.createNotice(studyId, noticeData, files);
      
      if (response.success) {
        // 목록 새로고침
        await getNotices(studyId);
        return {
          success: true,
          message: "공지사항이 성공적으로 생성되었습니다.",
          data: response.data
        };
      } else {
        setError(response.message || "공지사항 생성 중 오류가 발생했습니다.");
        return {
          success: false,
          message: response.message || "공지사항 생성 중 오류가 발생했습니다."
        };
      }
    } catch (err) {
      console.error("[NoticeProvider] 공지사항 생성 중 오류 발생:", err);
      setError("공지사항 생성 중 오류가 발생했습니다.");
      return {
        success: false,
        message: err.message || "공지사항 생성 중 오류가 발생했습니다."
      };
    } finally {
      setIsLoading(false);
    }
  }, [getNotices]);

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
          // 응답 데이터 또는 수정된 데이터 준비
          const updatedNoticeData = response.data || {
            ...noticeData,
            noticeId: noticeId,
          };

          // 수정된 공지사항으로 상태 업데이트
          setNotices((prev) => {
            // 해당 공지사항 업데이트
            return prev.map((notice) =>
              notice.noticeId === noticeId
                ? {
                    ...notice,
                    ...updatedNoticeData,
                  }
                : notice
            );
          });

          // 선택된 공지사항이 있고 ID가 일치하면 해당 공지사항도 업데이트
          if (selectedNotice && selectedNotice.noticeId === noticeId) {
            setSelectedNotice((prevSelected) => ({
              ...prevSelected,
              ...updatedNoticeData,
            }));
          }

          // 수정 후 새로운 데이터 가져오기
          try {
            const freshData = await noticeService.getNoticeById(
              studyId,
              noticeId
            );
            if (freshData.success && freshData.data) {
              // selectedNotice 업데이트
              setSelectedNotice(freshData.data);

              // 목록의 데이터도 최신 데이터로 업데이트
              setNotices((prev) =>
                prev.map((notice) =>
                  notice.noticeId === noticeId ? freshData.data : notice
                )
              );

              console.log(
                "[NoticeProvider] 공지사항 수정 후 데이터 새로고침 완료"
              );
            }
          } catch (refreshError) {
            console.error(
              "[NoticeProvider] 수정 후 데이터 새로고침 실패:",
              refreshError
            );
          }

          return {
            success: true,
            message: "공지사항이 성공적으로 수정되었습니다.",
            data: updatedNoticeData,
          };
        } else {
          throw new Error(response.message || "공지사항 수정에 실패했습니다.");
        }
      } catch (err) {
        console.error("[NoticeProvider] 공지사항 수정 실패:", err);
        return {
          success: false,
          message: err.message || "공지사항 수정에 실패했습니다.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [selectedNotice]
  );

  // 공지사항 삭제
  const deleteNotice = useCallback(async (studyId, noticeId) => {
    if (!studyId || !noticeId) {
      console.error("[NoticeProvider] 공지사항 삭제 실패: 스터디ID 또는 공지사항ID 누락");
      return { 
        success: false, 
        message: "필수 정보가 누락되었습니다." 
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[NoticeProvider] 공지사항 삭제 요청: ${studyId}/${noticeId}`);
      const response = await noticeService.deleteNotice(studyId, noticeId);
      
      if (response.success) {
        // 목록에서 삭제된 공지사항 제거
        setNotices(prevNotices => 
          prevNotices.filter(notice => notice.noticeId !== parseInt(noticeId, 10))
        );
        
        // 현재 선택된 공지사항이 삭제되는 경우 초기화
        if (selectedNotice && selectedNotice.noticeId === parseInt(noticeId, 10)) {
          setSelectedNotice(null);
        }
        
        return {
          success: true,
          message: "공지사항이 성공적으로 삭제되었습니다."
        };
      } else {
        setError(response.message || "공지사항 삭제 중 오류가 발생했습니다.");
        return {
          success: false,
          message: response.message
        };
      }
    } catch (err) {
      console.error("[NoticeProvider] 공지사항 삭제 중 오류:", err);
      setError("공지사항 삭제 중 오류가 발생했습니다.");
      return {
        success: false,
        message: err.message || "공지사항 삭제 중 오류가 발생했습니다."
      };
    } finally {
      setIsLoading(false);
    }
  }, [selectedNotice]);

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
