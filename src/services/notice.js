import { api, tokenUtils } from "./api";
import axios from "axios";

export const noticeService = {
  // 공지사항 목록 조회
  getNotices: async (studyId, params = {}) => {
    try {
      console.log("[NoticeService] 공지사항 목록 조회 요청");

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn(
          "[NoticeService] 토큰 없음, 공지사항 목록 조회 시 인증 문제 가능성"
        );
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      const response = await api.get(`/studies/${studyId}/notices`, {
        params,
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[NoticeService] 공지사항 목록 조회 성공:", response.data);

      // 응답이 문자열인 경우 안전하게 처리
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          console.log("[NoticeService] 문자열 응답 처리 시도");

          // HTML 응답인 경우 빈 배열 반환
          if (responseData.includes("<!DOCTYPE html>")) {
            console.warn("[NoticeService] HTML 응답 감지, 빈 배열 반환");
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
            console.error("[NoticeService] 데이터 파싱 실패:", parseError);
            return {
              success: false,
              message: "데이터 처리 중 오류가 발생했습니다",
              data: [],
            };
          }
        } catch (error) {
          console.error("[NoticeService] 응답 처리 오류:", error);
          return {
            success: false,
            message: "응답 처리 중 오류가 발생했습니다",
            data: [],
          };
        }
      }

      // 응답이 없거나 유효하지 않은 경우
      if (!responseData) {
        console.warn("[NoticeService] 유효하지 않은 응답 데이터");
        return {
          success: false,
          message: "유효하지 않은 응답 데이터입니다",
          data: [],
        };
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let noticeData = responseData;
      let memberContext = null;

      if (responseData.data !== undefined) {
        console.log(
          "[NoticeService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        noticeData = responseData.data;
        memberContext = responseData.memberContext || null;

        console.log("[NoticeService] 멤버 컨텍스트:", memberContext);
      }

      // 데이터가 배열인지 확인
      let dataArray = Array.isArray(noticeData)
        ? noticeData
        : noticeData
        ? [noticeData]
        : [];

      if (dataArray.length > 0) {
        console.log(
          "[NoticeService] 첫 번째 공지사항 객체 필드:",
          Object.keys(dataArray[0])
        );

        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log(
          "[NoticeService] noticeId 존재 여부:",
          "noticeId" in dataArray[0]
        );
        console.log(
          "[NoticeService] noticeTitle 존재 여부:",
          "noticeTitle" in dataArray[0]
        );
        console.log(
          "[NoticeService] noticeContent 존재 여부:",
          "noticeContent" in dataArray[0]
        );

        // 데이터 유효성 검사 및 기본값 설정
        dataArray = dataArray.map((notice) => {
          const processedNotice = { ...notice };

          // noticeId가 없거나 유효하지 않은 경우
          if (!processedNotice.noticeId || isNaN(processedNotice.noticeId)) {
            console.warn(
              "[NoticeService] noticeId 필드 없음 또는 유효하지 않음, 임의 ID 설정"
            );
            processedNotice.noticeId = Math.floor(Math.random() * 10000);
          }

          // 제목이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedNotice.noticeTitle === undefined ||
            processedNotice.noticeTitle === null ||
            processedNotice.noticeTitle.trim() === ""
          ) {
            console.warn(
              "[NoticeService] noticeTitle 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedNotice.noticeTitle = "제목 없음";
          }

          // 내용이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedNotice.noticeContent === undefined ||
            processedNotice.noticeContent === null ||
            processedNotice.noticeContent.trim() === ""
          ) {
            console.warn(
              "[NoticeService] noticeContent 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedNotice.noticeContent = "내용 없음";
          }

          // 생성일이 없는 경우
          if (!processedNotice.noticeCreatedAt) {
            console.warn(
              "[NoticeService] noticeCreatedAt 필드 없음, 현재 시간으로 설정"
            );
            processedNotice.noticeCreatedAt = new Date().toISOString();
          }

          // 수정일이 없는 경우
          if (!processedNotice.noticeModifiedAt) {
            console.warn(
              "[NoticeService] noticeModifiedAt 필드 없음, 생성일과 동일하게 설정"
            );
            processedNotice.noticeModifiedAt = processedNotice.noticeCreatedAt;
          }

          // 파일 배열 확인
          if (!processedNotice.files) {
            processedNotice.files = [];
          }

          return processedNotice;
        });
      }

      // 최종 결과 반환
      return {
        success: true,
        data: dataArray,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[NoticeService] 공지사항 목록 조회 오류:", error);
      // 오류 발생 시 오류 정보와 함께 빈 배열 반환
      return {
        success: false,
        message:
          error.message || "공지사항 목록을 불러오는 중 오류가 발생했습니다",
        data: [],
      };
    }
  },

  // 이미지 업로드 함수
  ImageUploadToS3: async (presignedUrl, imageFile) => {
    try {
      console.log("[ImageUploadToS3] 이미지 업로드 시작:", imageFile.name);

      // 프리사인드 URL에서 Content-Type 추출
      let contentType = imageFile.type;

      // URL에서 Content-Type 파라미터가 있는지 확인
      try {
        const urlObj = new URL(presignedUrl);
        const params = new URLSearchParams(urlObj.search);
        if (params.has("Content-Type")) {
          contentType = params.get("Content-Type");
          console.log(
            `[ImageUploadToS3] 프리사인드 URL에서 추출한 Content-Type 사용: ${contentType}`
          );
        }
      } catch (urlError) {
        console.warn(
          "[ImageUploadToS3] URL 파싱 실패, 파일 타입 사용:",
          urlError
        );
      }

      const uploadResponse = await axios.put(presignedUrl, imageFile, {
        headers: {
          "Content-Type": contentType,
        },
      });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        console.log("[ImageUploadToS3] 이미지 업로드 성공:", imageFile.name);
      } else {
        console.error("[ImageUploadToS3] 이미지 업로드 실패:", imageFile.name);
        throw new Error(`이미지 업로드 실패: ${imageFile.name}`);
      }
    } catch (error) {
      console.error("[ImageUploadToS3] 이미지 업로드 중 오류:", error);
      throw error;
    }
  },

  // 파일 업로드 함수
  FileUploadToS3: async (presignedUrl, file) => {
    try {
      console.log("[FileUploadToS3] 파일 업로드 시작:", file.name);

      // 프리사인드 URL에서 Content-Type 추출
      let contentType = file.type || "application/octet-stream";

      // URL에서 Content-Type 파라미터가 있는지 확인
      try {
        const urlObj = new URL(presignedUrl);
        const params = new URLSearchParams(urlObj.search);
        if (params.has("Content-Type")) {
          contentType = params.get("Content-Type");
          console.log(
            `[FileUploadToS3] 프리사인드 URL에서 추출한 Content-Type 사용: ${contentType}`
          );
        }
      } catch (urlError) {
        console.warn(
          "[FileUploadToS3] URL 파싱 실패, 파일 타입 사용:",
          urlError
        );
      }

      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": contentType,
        },
      });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        console.log("[FileUploadToS3] 파일 업로드 성공:", file.name);
      } else {
        console.error("[FileUploadToS3] 파일 업로드 실패:", file.name);
        throw new Error(`파일 업로드 실패: ${file.name}`);
      }
    } catch (error) {
      console.error("[FileUploadToS3] 파일 업로드 중 오류:", error);
      throw error;
    }
  },

  createNotice: async (studyId, newNotice, files = []) => {
    try {
      console.log("[NoticeService] 공지사항 생성 요청:", newNotice);
      console.log("[NoticeService] 첨부 파일 수:", files && files.length);

      // 백엔드 DTO 구조에 맞게 데이터 변환
      // noticeTitle, noticeContent 필드 또는 title, content 필드 처리
      const requestData = {
        noticeTitle: newNotice.noticeTitle || newNotice.title || "",
        noticeContent: newNotice.noticeContent || newNotice.content || "",
        fileNames: newNotice.fileNames || [],
      };

      console.log("[NoticeService] 변환된 요청 데이터:", requestData);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[NoticeService] 토큰 없음, 공지사항 생성 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 토큰 형식 확인
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.post(
        `/studies/${studyId}/notices/add`,
        requestData,
        {
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("[NoticeService] 공지사항 생성 응답:", response.data);

      // 응답 데이터 정제
      let result = {
        success: true
      };

      // API 응답 구조 확인
      if (response.data) {
        try {
          // 백엔드 API 응답이 memberContext/data 구조인지 확인
          if (response.data.data) {
            result.data = response.data.data;
            result.memberContext = response.data.memberContext;
          } else {
            // 단일 객체인 경우 그대로 사용
            result.data = response.data;
          }
          
          // result.data가 문자열인 경우 JSON 파싱 시도
          if (typeof result.data === 'string') {
            try {
              result.data = JSON.parse(result.data);
            } catch (parseError) {
              console.warn("[NoticeService] 응답 데이터 파싱 실패:", parseError);
            }
          }

          // 응답 데이터가 null이거나 빈 객체인 경우 기본 데이터 생성
          if (!result.data || Object.keys(result.data).length === 0) {
            console.log("[NoticeService] 응답 데이터가 비어있음, 기본 데이터 사용");
            result.data = {
              noticeId: Math.floor(Math.random() * 10000), // 임시 ID
              noticeTitle: requestData.noticeTitle,
              noticeContent: requestData.noticeContent,
              noticeCreatedAt: new Date().toISOString(),
              noticeModifiedAt: new Date().toISOString(),
              files: []
            };
          }

          // 응답에 noticeId가 없는 경우 보완
          if (!result.data.noticeId && result.data.id) {
            result.data.noticeId = result.data.id;
          }

          // 필수 필드 확인 및 보완
          if (!result.data.noticeTitle && requestData.noticeTitle) {
            result.data.noticeTitle = requestData.noticeTitle;
          }
          
          if (!result.data.noticeContent && requestData.noticeContent) {
            result.data.noticeContent = requestData.noticeContent;
          }

          if (!result.data.noticeCreatedAt) {
            result.data.noticeCreatedAt = new Date().toISOString();
          }

          if (!result.data.noticeModifiedAt) {
            result.data.noticeModifiedAt = result.data.noticeCreatedAt || new Date().toISOString();
          }

          // 백엔드가 title/content 필드를 사용하는 경우, notice* 필드로 통일
          if (result.data.title && !result.data.noticeTitle) {
            result.data.noticeTitle = result.data.title;
          }
          
          if (result.data.content && !result.data.noticeContent) {
            result.data.noticeContent = result.data.content;
          }
          
          // 생성일/수정일 필드가 다른 이름으로 오는 경우 처리
          if (result.data.createdAt && !result.data.noticeCreatedAt) {
            result.data.noticeCreatedAt = result.data.createdAt;
          }
          
          if (result.data.modifiedAt && !result.data.noticeModifiedAt) {
            result.data.noticeModifiedAt = result.data.modifiedAt;
          }

          // files 필드가 없는 경우 빈 배열 추가
          if (!result.data.files) {
            result.data.files = [];
          }

          console.log("[NoticeService] 정제된 응답 데이터:", result);
        } catch (processingError) {
          console.error("[NoticeService] 응답 데이터 처리 오류:", processingError);
          // 오류가 발생해도 기본 정보는 설정
          result.data = {
            noticeId: Math.floor(Math.random() * 10000),
            noticeTitle: requestData.noticeTitle,
            noticeContent: requestData.noticeContent,
            noticeCreatedAt: new Date().toISOString(),
            noticeModifiedAt: new Date().toISOString(),
            files: []
          };
        }
      }

      // 파일 업로드 처리 (백엔드 응답 구조에 따라 달라짐)
      if (files && files.length > 0) {
        try {
          // 백엔드 응답에 uploadUrls 또는 data 배열이 있는지 확인
          const hasUploadUrls =
            response.data &&
            ((response.data.uploadUrls &&
              response.data.uploadUrls.length > 0) ||
              (response.data.data &&
                Array.isArray(response.data.data) &&
                response.data.data.length > 0));

          if (hasUploadUrls) {
            console.log("[NoticeService] 파일 업로드 URL 감지, 업로드 시작");
            await handleFileUpload(response.data, files);
            console.log("[NoticeService] 파일 업로드 완료");
          } else {
            console.log(
              "[NoticeService] 업로드 URL이 없어 파일 업로드를 건너뜁니다"
            );
          }
        } catch (uploadError) {
          console.error("[NoticeService] 파일 업로드 중 오류:", uploadError);
          result.warning = "공지사항은 생성되었으나 일부 파일 업로드에 실패했습니다.";
        }
      }

      return result;
    } catch (error) {
      console.error("[NoticeService] 공지사항 생성 오류:", error);
      // 에러 처리...
      throw error;
    }
  },

  // 공지사항 상세 조회
  getNoticeById: async (studyId, noticeId) => {
    try {
      console.log(
        `[NoticeService] 공지사항 상세 조회 요청: ${studyId}/notices/${noticeId}`
      );

      const response = await api.get(
        `/studies/${studyId}/notices/${noticeId}`,
        {
          withCredentials: true,
        }
      );

      console.log("[NoticeService] 공지사항 상세 조회 성공:", response.data);

      // 데이터 유효성 검사 추가
      let responseData = response.data;

      // 데이터가 없거나 잘못된 형식인 경우 처리
      if (!responseData) {
        console.warn("[NoticeService] 응답 데이터 없음");
        return {
          success: false,
          message: "공지사항 데이터를 불러올 수 없습니다.",
          data: null,
        };
      }

      // API 응답 구조 분석 (memberContext, data 구조 처리)
      let data = responseData;
      let memberContext = null;

      // 새로운 API 응답 형식 확인 (memberContext/data 구조)
      if (responseData.data !== undefined) {
        console.log(
          "[NoticeService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        data = responseData.data;
        memberContext = responseData.memberContext || null;
      }

      // 백엔드 응답 구조 로깅
      console.log("[NoticeService] 게시판 상세 응답 구조:", {
        hasData: !!data,
        dataType: typeof data,
        fields: data ? Object.keys(data) : [],
      });

      // 데이터가 없는 경우 기본 구조 생성
      if (!data) {
        data = {
          noticeId: noticeId,
          noticeTitle: "제목 없음",
          noticeContent: "내용 없음",
          noticeCreatedAt: new Date().toISOString(),
          noticeModifiedAt: new Date().toISOString(),
          files: [],
        };
      } else {
        // 필수 필드가 없는 경우 기본값 설정
        if (
          data.noticeTitle === undefined ||
          data.noticeTitle === null ||
          data.noticeTitle.trim() === ""
        ) {
          console.warn(
            "[NoticeService] noticeTitle 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.noticeTitle = "제목 없음";
        }

        if (
          data.noticeContent === undefined ||
          data.noticeContent === null ||
          data.noticeContent.trim() === ""
        ) {
          console.warn(
            "[noticeService] noticeContent 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.noticeContent = "내용 없음";
        }

        if (!data.noticeCreatedAt) {
          console.warn(
            "[noticeService] noticeCreatedAt 필드 없음, 현재 시간으로 설정"
          );
          data.noticeCreatedAt = new Date().toISOString();
        }

        if (!data.noticeModifiedAt) {
          console.warn(
            "[noticeService] noticeModifiedAt 필드 없음, 생성일과 동일하게 설정"
          );
          data.noticeModifiedAt = data.noticeCreatedAt;
        }

        // 파일 배열 확인
        if (!data.files) {
          data.files = [];
        }
      }

      console.log("[noticeService] 가공된 공지사항 상세 데이터:", data);

      // memberContext가 있으면 함께 반환
      return {
        success: true,
        data: data,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[NoticeService] 공지사항 상세 조회 오류:", error);
      return {
        success: false,
        message: error.message || "공지사항을 불러오는 중 오류가 발생했습니다.",
        data: null,
      };
    }
  },

  // 공지사항 삭제
  deleteNotice: async (studyId, noticeId) => {
    try {
      console.log(
        `[NoticeService] 공지사항 삭제 요청: /studies/${studyId}/notices/${noticeId}`
      );

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[NoticeService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.delete(
        `/studies/${studyId}/notices/${noticeId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
          },
        }
      );

      console.log("[NoticeService] 공지사항 삭제 성공:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("[NoticeService] 공지사항 삭제 오류:", error);
      if (error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 공지사항을 삭제할 수 없습니다.",
        };
      }
      throw error;
    }
  },
  // 공지사항 수정
  editNotice: async (studyId, noticeId, noticeData, files = []) => {
    try {
      console.log(
        `[NoticeService] 공지사항 수정 요청: /studies/${studyId}/notices/${noticeId}`
      );
      console.log("[NoticeService] 수정 데이터:", noticeData);
      console.log("[NoticeService] 첨부 파일 수:", files.length);

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        noticeTitle: noticeData.noticeTitle || "",
        noticeContent: noticeData.noticeContent || "",
        remainingFileIds: noticeData.remainingFileIds || [], // 남겨둘 파일 ID (long 타입)
        newFileNames: noticeData.newFileNames || [], // 새로운 파일명 (string 타입)
      };

      console.log("[NoticeService] 최종 요청 데이터:", requestData);

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[NoticeService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/notices/${noticeId}`,
        requestData,
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[NoticeService] 공지사항 수정 성공:", response.data);

      // 파일 업로드 처리
      if (files && files.length > 0) {
        // 백엔드 응답에서 업로드 URL 확인
        const hasUploadUrls =
          response.data &&
          ((response.data.uploadUrls && response.data.uploadUrls.length > 0) ||
            (response.data.data &&
              Array.isArray(response.data.data) &&
              response.data.data.length > 0));

        if (hasUploadUrls) {
          try {
            console.log("[NoticeService] 파일 업로드 시작");
            await handleFileUpload(response.data, files);
            console.log("[NoticeService] 파일 업로드 완료");
          } catch (uploadError) {
            console.error("[NoticeService] 파일 업로드 중 오류:", uploadError);
            return {
              success: true,
              data: response.data,
              warning:
                "공지사항은 수정되었으나 일부 파일 업로드에 실패했습니다.",
            };
          }
        } else {
          console.warn(
            "[NoticeService] 업로드 URL이 없어 파일 업로드를 건너뜁니다"
          );
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[NoticeService] 공지사항 수정 오류:", error);

      // 권한이 없는 경우 (403)
      if (error.response && error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 공지사항을 수정할 수 없습니다.",
        };
      }
      return {
        success: false,
        message: error.message || "공지사항 수정 중 오류가 발생했습니다.",
      };
    }
  },
};

const handleFileUpload = async (responseData, files) => {
  try {
    console.log("[FileUpload] 파일 업로드 시작");

    let uploadUrls = [];

    // 백엔드 응답 구조 대응: presignedUrls 또는 data 배열 확인
    if (responseData.presignedUrls && responseData.presignedUrls.length > 0) {
      uploadUrls = responseData.presignedUrls;
      console.log("[FileUpload] presignedUrls 사용:", uploadUrls.length);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      uploadUrls = responseData.data.map((file) => file.uploadUrl);
      console.log(
        "[FileUpload] data 배열에서 fileUrl 추출:",
        uploadUrls.length
      );
    }

    if (uploadUrls.length > 0) {
      // 각 파일에 대해 업로드 처리
      for (let i = 0; i < Math.min(files.length, uploadUrls.length); i++) {
        const file = files[i];
        const uploadUrl = uploadUrls[i];

        if (!uploadUrl) {
          console.warn(
            `[FileUpload] ${i + 1}번째 파일의 업로드 URL이 없습니다`
          );
          continue;
        }

        try {
          console.log(`[FileUpload] 파일 '${file.name}' 업로드 시작`);

          // 프리사인드 URL에서 필요한 메타데이터 확인
          let contentType = null;
          try {
            const urlObj = new URL(uploadUrl);
            const params = new URLSearchParams(urlObj.search);
            if (params.has("Content-Type")) {
              contentType = params.get("Content-Type");
              console.log(
                `[FileUpload] URL에서 찾은 Content-Type: ${contentType}`
              );
            }
          } catch (urlError) {
            console.warn("[FileUpload] URL 파싱 실패:", urlError);
          }

          // 파일 유형에 따라 적절한 업로드 함수 선택 (Content-Type 고려)
          if (contentType) {
            console.log(
              `[FileUpload] 프리사인드 URL에 지정된 Content-Type 사용: ${contentType}`
            );
            // 백엔드에서 지정한 Content-Type이 있으면 해당 유형으로 업로드
            if (contentType.startsWith("image/")) {
              await noticeService.ImageUploadToS3(uploadUrl, file);
            } else {
              await noticeService.FileUploadToS3(uploadUrl, file);
            }
          } else {
            // 기존 방식으로 처리 (파일 유형에 따라)
            if (file.type.startsWith("image/")) {
              await noticeService.ImageUploadToS3(uploadUrl, file);
              console.log(`[FileUpload] 이미지 '${file.name}' 업로드 성공`);
            } else {
              await noticeService.FileUploadToS3(uploadUrl, file);
              console.log(`[FileUpload] 파일 '${file.name}' 업로드 성공`);
            }
          }
        } catch (individualError) {
          console.error(
            `[FileUpload] '${file.name}' 파일 업로드 실패:`,
            individualError
          );
          // 개별 파일 실패 시 다른 파일 업로드는 계속 진행
        }
      }
      console.log("[FileUpload] 모든 파일 업로드 완료");
    } else {
      console.log("[FileUpload] 업로드할 URL이 없어 파일 업로드를 건너뜁니다");
    }
  } catch (error) {
    console.error("[FileUpload] 파일 업로드 처리 중 오류:", error);
    throw error;
  }
};
