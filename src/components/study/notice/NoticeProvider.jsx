import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // 요청 상태 추적을 위한 레퍼런스 추가
  const pendingRequests = useRef({});
  const cachedNotices = useRef({});
  const cachedNoticeDetails = useRef({});
  const lastFetchTime = useRef(null);

  // 캐시 유효성 검사 (10분 = 600000ms)
  const isCacheValid = () => {
    if (!lastFetchTime.current) return false;
    return Date.now() - lastFetchTime.current < 600000;
  };

  // 공지사항 목록 불러오기 (최적화)
  const getNotices = useCallback(async (studyId) => {
    if (!studyId) return;

    // 이미 진행 중인 요청이 있는지 확인
    const requestKey = `getNotices_${studyId}`;
    if (pendingRequests.current[requestKey]) {
      console.log(
        "[NoticeProvider] 이미 진행 중인 공지사항 목록 요청이 있습니다."
      );
      return;
    }

    // 캐시된 데이터가 있는지 확인
    if (cachedNotices.current[studyId] && isCacheValid()) {
      console.log("[NoticeProvider] 캐시된 공지사항 목록 사용");
      const cachedData = cachedNotices.current[studyId];
      setNotices(cachedData.notices);
      setMemberRole(cachedData.memberRole);
      setInitialLoadDone(true);
      return;
    }

    pendingRequests.current[requestKey] = true;
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
        const sortedNotices = [...(response.data || [])].sort(
          (a, b) => new Date(b.noticeCreatedAt) - new Date(a.noticeCreatedAt)
        );
        setNotices(sortedNotices);

        // 캐시에 저장
        cachedNotices.current[studyId] = {
          notices: sortedNotices,
          memberRole: response.memberContext?.memberRole || "PARTICIPANT",
        };
        lastFetchTime.current = Date.now();
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
      delete pendingRequests.current[requestKey];
    }
  }, []);

  // 컴포넌트 마운트 시 한 번만 공지사항 목록 가져오기
  useEffect(() => {
    if (studyId && !initialLoadDone) {
      getNotices(studyId);
    }
  }, [studyId, initialLoadDone, getNotices]);

  // 공지사항 상세보기 (최적화)
  const getNoticeById = useCallback(
    async (studyId, noticeId) => {
      if (!studyId || !noticeId) return;
      noticeId = parseInt(noticeId, 10);

      // 이미 진행 중인 요청이 있는지 확인
      const requestKey = `getNoticeById_${studyId}_${noticeId}`;
      if (pendingRequests.current[requestKey]) {
        console.log(
          "[NoticeProvider] 이미 진행 중인 공지사항 상세 요청이 있습니다."
        );
        return;
      }

      // 현재 선택된 공지사항이 이미 같은 것인지 확인
      if (selectedNotice && selectedNotice.noticeId === noticeId) {
        console.log("[NoticeProvider] 이미 선택된 공지사항과 동일함");
        return;
      }

      // 캐시된 데이터가 있는지 확인
      if (
        cachedNoticeDetails.current[`${studyId}_${noticeId}`] &&
        isCacheValid()
      ) {
        console.log("[NoticeProvider] 캐시된 공지사항 상세 정보 사용");
        const cachedData =
          cachedNoticeDetails.current[`${studyId}_${noticeId}`];
        setSelectedNotice(cachedData.notice);
        if (cachedData.memberRole) setMemberRole(cachedData.memberRole);
        return;
      }

      // 목록에서 기본 정보를 먼저 표시
      const noticeFromList = notices.find(
        (notice) => notice.noticeId === noticeId
      );
      if (noticeFromList) {
        console.log("[NoticeProvider] 목록에서 공지사항 기본 정보 사용");
        setSelectedNotice(noticeFromList);
      }

      pendingRequests.current[requestKey] = true;
      setIsLoading(true);
      setError(null);

      try {
        const response = await noticeService.getNoticeById(studyId, noticeId);

        if (response.memberContext && response.memberContext.memberRole) {
          setMemberRole(response.memberContext.memberRole);
        }

        if (response.success) {
          setSelectedNotice(response.data);

          // 캐시에 저장
          cachedNoticeDetails.current[`${studyId}_${noticeId}`] = {
            notice: response.data,
            memberRole: response.memberContext?.memberRole,
          };
          lastFetchTime.current = Date.now();
        } else {
          setError(response.message || "공지사항을 불러오는데 실패했습니다.");
          if (!noticeFromList) setSelectedNotice(null);
        }
      } catch (err) {
        console.error("공지사항 상세 조회 실패:", err);
        setError(err.message || "공지사항을 불러오는데 실패했습니다.");
        if (!noticeFromList) setSelectedNotice(null);
      } finally {
        setIsLoading(false);
        delete pendingRequests.current[requestKey];
      }
    },
    [notices, selectedNotice]
  );

  // 캐시 무효화 함수
  const invalidateCache = useCallback((studyId) => {
    // 캐시 초기화
    if (studyId) {
      delete cachedNotices.current[studyId];

      // 해당 스터디의 모든 공지사항 상세 캐시 삭제
      Object.keys(cachedNoticeDetails.current).forEach((key) => {
        if (key.startsWith(`${studyId}_`)) {
          delete cachedNoticeDetails.current[key];
        }
      });
    } else {
      // 전체 캐시 초기화
      cachedNotices.current = {};
      cachedNoticeDetails.current = {};
    }
    lastFetchTime.current = null;
  }, []);

  // 공지사항 생성 (캐시 무효화 추가)
  // 공지사항 생성 (에러 처리 간소화)
  const createNotice = useCallback(
    async (studyId, newNotice, files = []) => {
      setIsLoading(true);
      try {
        const response = await noticeService.createNotice(
          studyId,
          newNotice,
          files
        );

        // 응답 데이터가 있거나 success가 true인 경우 성공으로 처리
        if (response.data || response.success) {
          // 목록에 새 공지사항 추가
          if (response.data) {
            setNotices((prev) => {
              const updatedNotices = [response.data, ...prev];
              return updatedNotices.sort(
                (a, b) =>
                  new Date(b.noticeCreatedAt) - new Date(a.noticeCreatedAt)
              );
            });

            // 캐시 무효화
            invalidateCache(studyId);
          }

          // 성공 응답 반환 (warning 관련 로직 제거)
          return {
            success: true,
            message: "공지사항이 성공적으로 생성되었습니다.",
            data: response.data,
          };
        } else {
          // 명확한 에러 메시지가 있는 경우에만 에러 발생
          if (response.message) {
            throw new Error(response.message);
          } else {
            return {
              success: true,
              message: "공지사항이 생성되었습니다.",
              data: response.data,
            };
          }
        }
      } catch (err) {
        console.error("[NoticeProvider] 공지사항 등록 실패:", err);

        // 간소화된 에러 처리
        return {
          success: false,
          message: "공지사항 등록 중 문제가 발생했습니다.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [invalidateCache]
  );

  // 공지사항 수정 (캐시 무효화 추가)
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

          // 캐시 무효화
          invalidateCache(studyId);

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
    [invalidateCache]
  );

  // 공지사항 삭제 (캐시 무효화 추가)
  const deleteNotice = useCallback(
    async (studyId, noticeId) => {
      setIsLoading(true);
      try {
        const response = await noticeService.deleteNotice(studyId, noticeId);
        if (response.success) {
          // 삭제된 공지사항을 목록에서 제거
          setNotices((prev) =>
            prev.filter((notice) => notice.noticeId !== noticeId)
          );

          // 캐시 무효화
          invalidateCache(studyId);

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
    },
    [invalidateCache]
  );

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
        invalidateCache,
      }}
    >
      {children}
    </NoticeContext.Provider>
  );
}

NoticeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
