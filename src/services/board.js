import { api, tokenUtils } from "./api";
import axios from "axios";

export const boardService = {
  // 게시글 목록 조회
  getBoards: async (studyId, params = {}) => {
    try {
      console.log("[BoardService] 게시글 목록 조회 요청");

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn(
          "[BoardService] 토큰 없음, 게시글 목록 조회 시 인증 문제 가능성"
        );
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      const response = await api.get(`/studies/${studyId}/posts`, {
        params,
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[BoardService] 게시글 목록 조회 성공:", response.data);

      // 응답이 문자열인 경우 안전하게 처리
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          console.log("[BoardService] 문자열 응답 처리 시도");

          // HTML 응답인 경우 빈 배열 반환
          if (responseData.includes("<!DOCTYPE html>")) {
            console.warn("[BoardService] HTML 응답 감지, 빈 배열 반환");
            return {
              success: false,
              message: "유효하지 않은 응답 형식입니다",
              data: [],
            };
          }

          // JSON 문자열인 경우 파싱 시도
          try {
            responseData = JSON.parse(responseData);
          } catch (parseError) {
            console.error("[BoardService] 데이터 파싱 실패:", parseError);
            return {
              success: false,
              message: "데이터 처리 중 오류가 발생했습니다",
              data: [],
            };
          }
        } catch (error) {
          console.error("[BoardService] 응답 처리 오류:", error);
          return {
            success: false,
            message: "응답 처리 중 오류가 발생했습니다",
            data: [],
          };
        }
      }

      // 응답이 없거나 유효하지 않은 경우
      if (!responseData) {
        console.warn("[BoardService] 유효하지 않은 응답 데이터");
        return {
          success: false,
          message: "유효하지 않은 응답 데이터입니다",
          data: [],
        };
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let boardData = responseData;
      let memberContext = null;

      if (responseData.data !== undefined) {
        console.log(
          "[BoardService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        boardData = responseData.data;
        memberContext = responseData.memberContext || null;

        console.log("[BoardService] 멤버 컨텍스트:", memberContext);
      }

      // 데이터가 배열인지 확인
      let dataArray = Array.isArray(boardData)
        ? boardData
        : boardData
        ? [boardData]
        : [];

      if (dataArray.length > 0) {
        console.log(
          "[BoardService] 첫 번째 게시글 객체 필드:",
          Object.keys(dataArray[0])
        );

        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log(
          "[BoardService] boardId 존재 여부:",
          "boardId" in dataArray[0]
        );
        console.log(
          "[BoardService] boardTitle 존재 여부:",
          "boardTitle" in dataArray[0]
        );
        console.log(
          "[BoardService] boardContent 존재 여부:",
          "boardContent" in dataArray[0]
        );

        // 데이터 유효성 검사 및 기본값 설정
        dataArray = dataArray.map((board) => {
          const processedBoard = { ...board };

          // boardId가 없거나 유효하지 않은 경우
          if (!processedBoard.boardId || isNaN(processedBoard.boardId)) {
            console.warn(
              "[BoardService] boardId 필드 없음 또는 유효하지 않음, 임의 ID 설정"
            );
            processedBoard.boardId = Math.floor(Math.random() * 10000);
          }

          // 제목이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedBoard.boardTitle === undefined ||
            processedBoard.boardTitle === null ||
            processedBoard.boardTitle.trim() === ""
          ) {
            console.warn(
              "[BoardService] boardTitle 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedBoard.boardTitle = "제목 없음";
          }

          // 내용이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedBoard.boardContent === undefined ||
            processedBoard.boardContent === null ||
            processedBoard.boardContent.trim() === ""
          ) {
            console.warn(
              "[BoardService] boardContent 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedBoard.boardContent = "내용 없음";
          }

          // 생성일이 없는 경우
          if (!processedBoard.boardCreatedAt) {
            console.warn(
              "[BoardService] boardCreatedAt 필드 없음, 현재 시간으로 설정"
            );
            processedBoard.boardCreatedAt = new Date().toISOString();
          }

          // 작성자 정보가 없는 경우
          if (!processedBoard.writer) {
            console.warn(
              "[BoardService] writer 필드 없음, 기본값 설정"
            );
            processedBoard.writer = "작성자 없음";
          }

          return processedBoard;
        });
      }

      // 최종 결과 반환
      return {
        success: true,
        data: dataArray,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[BoardService] 게시글 목록 조회 오류:", error);
      // 오류 발생 시 오류 정보와 함께 빈 배열 반환
      return {
        success: false,
        message:
          error.message || "게시글 목록을 불러오는 중 오류가 발생했습니다",
        data: [],
      };
    }
  },

  // 게시글 상세 조회
  getBoardById: async (studyId, boardId) => {
    try {
      console.log(`[BoardService] 게시글 상세 조회 요청: ${studyId}/posts/${boardId}`);

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      const response = await api.get(`/studies/${studyId}/posts/${boardId}`, {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[BoardService] 게시글 상세 조회 성공:", response.data);

      if (!response.data) {
        console.warn("[BoardService] 응답 데이터 없음");
        return {
          success: false,
          message: "게시글 정보를 불러올 수 없습니다.",
          data: null,
        };
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let data = response.data;
      let memberContext = null;

      if (response.data.data !== undefined) {
        console.log(
          "[BoardService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        data = response.data.data;
        memberContext = response.data.memberContext || null;
      }

      console.log("[BoardService] 게시판 상세 응답 구조:", {
        data,
        memberContext,
      });

      // 데이터 유효성 검사 및 기본값 설정
      const processedBoard = { ...data };

      // 필수 필드 확인 및 기본값 설정
      if (!processedBoard.boardId || isNaN(processedBoard.boardId)) {
        processedBoard.boardId = parseInt(boardId);
      }

      // 제목이 없거나, null이거나, 빈 문자열인 경우
      if (
        processedBoard.boardTitle === undefined ||
        processedBoard.boardTitle === null ||
        processedBoard.boardTitle.trim() === ""
      ) {
        console.warn(
          "[BoardService] boardTitle 필드 없음 또는 빈 값, 기본값 설정"
        );
        processedBoard.boardTitle = "제목 없음";
      }

      // 내용이 없거나, null이거나, 빈 문자열인 경우
      if (
        processedBoard.boardContent === undefined ||
        processedBoard.boardContent === null ||
        processedBoard.boardContent.trim() === ""
      ) {
        console.warn(
          "[BoardService] boardContent 필드 없음 또는 빈 값, 기본값 설정"
        );
        processedBoard.boardContent = "내용 없음";
      }

      // 생성일이 없는 경우
      if (!processedBoard.boardCreatedAt) {
        console.warn(
          "[BoardService] boardCreatedAt 필드 없음, 현재 시간으로 설정"
        );
        processedBoard.boardCreatedAt = new Date().toISOString();
      }

      // 작성자 정보가 없는 경우
      if (!processedBoard.writer) {
        console.warn(
          "[BoardService] writer 필드 없음, 기본값 설정"
        );
        processedBoard.writer = "작성자 없음";
      }

      console.log("[BoardService] 가공된 게시글 상세 데이터:", processedBoard);

      return {
        success: true,
        data: processedBoard,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[BoardService] 게시글 상세 조회 오류:", error);
      return {
        success: false,
        message:
          error.message || "게시글 정보를 불러오는 중 오류가 발생했습니다.",
        data: null,
      };
    }
  },

  // 게시글 삭제
  deleteBoard: async (studyId, boardId) => {
    try {
      console.log(`[BoardService] 게시글 삭제 요청: /studies/${studyId}/posts/${boardId}`);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[BoardService] 토큰 없음, 인증 필요");
        return {
          success: false,
          message: "인증이 필요합니다. 다시 로그인해주세요.",
        };
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.delete(`/studies/${studyId}/posts/${boardId}`, {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[BoardService] 게시글 삭제 성공:", response.data);

      // 성공 응답 반환
      return {
        success: true,
        message: "게시글이 성공적으로 삭제되었습니다.",
        data: response.data
      };
    } catch (error) {
      console.error("[BoardService] 게시글 삭제 오류:", error);
      return {
        success: false,
        message: error.message || "게시글 삭제 중 오류가 발생했습니다.",
      };
    }
  },

  // 게시글 수정
  updateBoard: async (studyId, boardId, boardData) => {
    try {
      console.log(`[BoardService] 게시글 수정 요청: /studies/${studyId}/posts/${boardId}`);
      console.log("[BoardService] 수정 데이터:", boardData);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[BoardService] 토큰 없음, 인증 필요");
        return {
          success: false,
          message: "인증이 필요합니다. 다시 로그인해주세요.",
        };
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      
      // API 요청 데이터 준비
      const requestData = {
        title: boardData.title,
        content: boardData.content,
      };
      
      console.log("[BoardService] 최종 요청 데이터:", requestData);

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/posts/${boardId}`,
        requestData,
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("[BoardService] 게시글 수정 성공:", response.data);

      // 성공 응답 반환
      return {
        success: true,
        message: "게시글이 성공적으로 수정되었습니다.",
        data: response.data
      };
    } catch (error) {
      console.error("[BoardService] 게시글 수정 오류:", error);
      return {
        success: false,
        message: error.message || "게시글 수정 중 오류가 발생했습니다.",
      };
    }
  },

  // 게시글 생성
  createBoard: async (studyId, newBoard) => {
    try {
      console.log("[BoardService] 게시글 생성 요청:", newBoard);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      
      // API 요청 데이터 준비
      const requestData = {
        title: newBoard.title,
        content: newBoard.content,
      };
      
      console.log("[BoardService] 변환된 요청 데이터:", requestData);

      if (!token) {
        console.error("[BoardService] 토큰 없음, 게시글 생성 불가");
        return {
          success: false,
          message: "인증이 필요합니다. 다시 로그인해주세요.",
        };
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.post(
        `/studies/${studyId}/posts`,
        requestData,
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("[BoardService] 게시글 생성 응답:", response.data);
      
      let responseData = response.data;
      let result = {
        success: true,
        message: "게시글이 성공적으로 생성되었습니다.",
      };

      // 응답 데이터 처리
      try {
        if (typeof responseData === "string") {
          try {
            responseData = JSON.parse(responseData);
          } catch (parseError) {
            console.warn("[BoardService] 응답 데이터 파싱 실패:", parseError);
          }
        }

        if (!responseData || Object.keys(responseData).length === 0) {
          console.log("[BoardService] 응답 데이터가 비어있음, 기본 데이터 사용");
          
          // 헤더에서 위치 정보 추출해 ID 찾기 시도
          const locationHeader = response.headers.location;
          let boardId = null;
          
          if (locationHeader) {
            const match = locationHeader.match(/\/([^\/]+)$/);
            if (match && match[1]) {
              boardId = parseInt(match[1]);
            }
          }
          
          result.data = {
            boardId: boardId || Date.now(),
            boardTitle: newBoard.title,
            boardContent: newBoard.content,
            boardCreatedAt: new Date().toISOString(),
            writer: "현재 사용자",
          };
        } else {
          // 응답 데이터 변환 및 정제
          if (responseData.data) {
            // { memberContext, data } 구조
            result.data = responseData.data;
            result.memberContext = responseData.memberContext;
          } else {
            // 직접 데이터 구조
            result.data = responseData;
          }

          // ID가 없는 경우 대체
          if (!result.data.boardId) {
            result.data.boardId = Date.now();
          }
        }

        console.log("[BoardService] 정제된 응답 데이터:", result);
      } catch (processingError) {
        console.error("[BoardService] 응답 데이터 처리 오류:", processingError);
      }

      return result;
    } catch (error) {
      console.error("[BoardService] 게시글 생성 오류:", error);
      return {
        success: false,
        message: error.message || "게시글 생성 중 오류가 발생했습니다.",
      };
    }
  }
}; 