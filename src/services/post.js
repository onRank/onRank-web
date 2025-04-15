import { api, tokenUtils } from "./api";
import axios from "axios";

const handleFileUpload = async (responseData, files) => {
  try {
    console.log("[FileUpload] 파일 업로드 시작");

    let uploadUrls = [];

    // 백엔드 응답 구조 대응: presignedUrls 또는 data 배열 확인
    if (responseData.presignedUrls && responseData.presignedUrls.length > 0) {
      uploadUrls = responseData.presignedUrls;
      console.log("[FileUpload] presignedUrls 사용:", uploadUrls.length);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // 새로운 백엔드 응답 구조: data 배열에서 fileUrl 추출
      uploadUrls = responseData.data.map((file) => file.fileUrl);
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

export const postService = {
  // 게시판 목록 조회
  getPosts: async (studyId, params = {}) => {
    try {
      console.log("[postService] 게시판 목록 조회 요청");

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn(
          "[postService] 토큰 없음, 게시판 목록 조회 시 인증 문제 가능성"
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

      console.log("[postService] 게시판 목록 조회 성공:", response.data);

      // 응답이 문자열인 경우 안전하게 처리
      let data = response.data;
      if (typeof data === "string") {
        try {
          console.log("[postService] 문자열 응답 처리 시도");

          // HTML 응답인 경우 빈 배열 반환
          if (data.includes("<!DOCTYPE html>")) {
            console.warn("[postService] HTML 응답 감지, 빈 배열 반환");
            return {
              success: false,
              message: "유효하지 않은 응답 형식입니다",
              data: [],
            };
          }

          // JSON 문자열인 경우 파싱 시도
          try {
            data = JSON.parse(data);
          } catch (parseError) {
            console.error("[postService] 데이터 파싱 실패:", parseError);
            return {
              success: false,
              message: "데이터 처리 중 오류가 발생했습니다",
              data: [],
            };
          }
        } catch (error) {
          console.error("[postService] 응답 처리 오류:", error);
          return {
            success: false,
            message: "응답 처리 중 오류가 발생했습니다",
            data: [],
          };
        }
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let postData = data;
      let memberContext = null;

      if (data && data.data && Array.isArray(data.data)) {
        console.log("[postService] 새 API 응답 구조 감지 (memberContext/data)");
        postData = data.data;
        memberContext = data.memberContext || null;
      }

      // 기존 data 변수를 postData로 변경
      data = postData;

      // 배열이 아닌 경우 배열로 변환
      if (!Array.isArray(data)) {
        console.warn("[postService] 응답이 배열이 아님, 배열로 변환:", data);
        data = data ? [data] : [];
      }

      if (data.length > 0) {
        console.log(
          "[postService] 첫 번째 게시판 객체 필드:",
          Object.keys(data[0])
        );

        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log("[postService] postId 존재 여부:", "postId" in data[0]);
        console.log(
          "[postService] postTitle 존재 여부:",
          "postTitle" in data[0]
        );
        console.log(
          "[postService] postContent 존재 여부:",
          "postContent" in data[0]
        );

        // 데이터 유효성 검사
        data = data.map((post) => {
          // postId가 없거나 유효하지 않은 경우
          if (!post.postId || isNaN(post.postId)) {
            console.warn(
              "[postService] postId 필드 없음 또는 유효하지 않음, 임의 ID 설정"
            );
            post.postId = Math.floor(Math.random() * 10000);
          }

          // 제목이 없거나 빈 문자열인 경우
          if (!post.postTitle || post.postTitle.trim() === "") {
            console.warn(
              "[postService] postTitle 필드 없음 또는 빈 값, 기본값 설정"
            );
            post.postTitle = "제목 없음";
          }

          // 내용이 없거나 빈 문자열인 경우
          if (!post.postContent || post.postContent.trim() === "") {
            console.warn(
              "[postService] postContent 필드 없음 또는 빈 값, 기본값 설정"
            );
            post.postContent = "내용 없음";
          }

          // 생성일이 없는 경우
          if (!post.postCreatedAt) {
            console.warn(
              "[postService] postCreatedAt 필드 없음, 현재 시간으로 설정"
            );
            post.postCreatedAt = new Date().toISOString();
          }

          // 수정일이 없는 경우
          if (!post.postModifiedAt) {
            console.warn(
              "[postService] postModifiedAt 필드 없음, 생성일과 동일하게 설정"
            );
            post.postModifiedAt = post.postCreatedAt;
          }

          // 작성자가 없는 경우
          if (!post.postWritenBy) {
            console.warn("[postService] postWritenBy 필드 없음, 기본값 설정");
            post.postWritenBy = "작성자 없음";
          }

          return post;
        });
      }

      return { success: true, data: data };
    } catch (error) {
      console.error("[postService] 게시판 목록 조회 오류:", error);
      // 오류 발생 시 오류 정보와 함께 빈 배열 반환
      return {
        success: false,
        message:
          error.message || "게시판 목록을 불러오는 중 오류가 발생했습니다",
        data: [],
      };
    }
  },

  // 게시판 생성
  createPost: async (studyId, newPost, files = []) => {
    try {
      console.log("[PostService] 게시판 생성 요청:", newPost);
      console.log("[PostService] 첨부 파일 수:", files && files.length);

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        postTitle: newPost.postTitle || "",
        postContent: newPost.postContent || "",
        fileNames: newPost.fileNames || [],
      };

      console.log("[PostService] 변환된 요청 데이터:", requestData);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("[PostService] 토큰 없음, 게시판 생성 불가");
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      // 토큰 형식 확인
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.post(
        `/studies/${studyId}/posts/add`,
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

      console.log("[PostService] 게시판 생성 응답:", response.data);

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
            console.log("[PostService] 파일 업로드 URL 감지, 업로드 시작");
            await handleFileUpload(response.data, files);
            console.log("[PostService] 파일 업로드 완료");
          } else {
            console.log(
              "[PostService] 업로드 URL이 없어 파일 업로드를 건너뜁니다"
            );
          }
        } catch (uploadError) {
          console.error("[PostService] 파일 업로드 중 오류:", uploadError);
          return {
            ...response.data,
            warning: "게시판은 생성되었으나 일부 파일 업로드에 실패했습니다.",
          };
        }
      }

      return response.data;
    } catch (error) {
      console.error("[PostService] 게시판 생성 오류:", error);
      // 에러 처리...
      throw error;
    }
  },

  // 게시판 상세 조회
  getPostById: async (studyId, postId) => {
    try {
      console.log(
        `[postService] 게시판 상세 조회 요청: ${studyId}/posts/${postId}`
      );

      const response = await api.get(`/studies/${studyId}/posts/${postId}`, {
        withCredentials: true,
      });

      console.log("[postService] 게시판 상세 조회 성공:", response.data);

      // 데이터 유효성 검사 추가
      let responseData = response.data;

      // 데이터가 없거나 잘못된 형식인 경우 처리
      if (!responseData) {
        console.warn("[postService] 응답 데이터 없음");
        return {
          success: false,
          message: "게시판 데이터를 불러올 수 없습니다.",
          data: null,
        };
      }

      // API 응답 구조 분석 (memberContext, data 구조 처리)
      let data = responseData;
      let memberContext = null;

      // 새로운 API 응답 형식 확인 (memberContext/data 구조)
      if (responseData.data !== undefined) {
        console.log("[postService] 새 API 응답 구조 감지 (memberContext/data)");
        data = responseData.data;
        memberContext = responseData.memberContext || null;
      }

      // 백엔드 응답 구조 로깅
      console.log("[postService] 게시판 상세 응답 구조:", {
        hasData: !!data,
        dataType: typeof data,
        fields: data ? Object.keys(data) : [],
      });

      // 데이터가 없는 경우 기본 구조 생성
      if (!data) {
        data = {
          postId: postId,
          postTitle: "제목 없음",
          postContent: "내용 없음",
          postCreatedAt: new Date().toISOString(),
          postModifiedAt: new Date().toISOString(),
          postWritenBy: "작성자 없음",
          files: [],
        };
      } else {
        // 필수 필드가 없는 경우 기본값 설정
        if (
          data.postTitle === undefined ||
          data.postTitle === null ||
          data.postTitle.trim() === ""
        ) {
          console.warn(
            "[postService] postTitle 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.postTitle = "제목 없음";
        }

        if (
          data.postContent === undefined ||
          data.postContent === null ||
          data.postContent.trim() === ""
        ) {
          console.warn(
            "[postService] postContent 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.postContent = "내용 없음";
        }

        if (!data.postCreatedAt) {
          console.warn(
            "[postService] postCreatedAt 필드 없음, 현재 시간으로 설정"
          );
          data.postCreatedAt = new Date().toISOString();
        }

        if (!data.postModifiedAt) {
          console.warn(
            "[postService] postModifiedAt 필드 없음, 생성일과 동일하게 설정"
          );
          data.postModifiedAt = data.postCreatedAt;
        }

        if (!data.postWritenBy || data.postWritenBy.trim() === "") {
          console.warn(
            "[postService] postWritenBy 필드 없음 또는 빈 값, 기본값 설정"
          );
          data.postWritenBy = "작성자 없음";
        }

        // 파일 배열 확인
        if (!data.files) {
          data.files = [];
        }
      }

      console.log("[postService] 가공된 게시판 상세 데이터:", data);

      // memberContext가 있으면 함께 반환
      return {
        success: true,
        data: data,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[postService] 게시판 상세 조회 오류:", error);
      return {
        success: false,
        message: error.message || "게시판을 불러오는 중 오류가 발생했습니다.",
        data: null,
      };
    }
  },

  // 게시판 삭제
  deletePost: async (studyId, postId) => {
    try {
      console.log(
        `[postService] 게시판 삭제 요청: /studies/${studyId}/posts/${postId}`
      );

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[postService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.delete(`/studies/${studyId}/posts/${postId}`, {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
        },
      });

      console.log("[postService] 게시판 삭제 성공:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("[postService] 게시판 삭제 오류:", error);
      if (error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 게시판을 삭제할 수 없습니다.",
        };
      }
      throw error;
    }
  },
  // 게시판 수정
  editPost: async (studyId, postId, postData, files = []) => {
    try {
      console.log(
        `[postService] 게시판 수정 요청: /studies/${studyId}/posts/${postId}`
      );

      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        postTitle: postData.postTitle || "",
        postContent: postData.postContent || "",
        fileNames: postData.fileNames || [], // 파일명 목록 추가
      };

      // 인증 토큰 추가
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[postService] 토큰 없음, 인증 필요");
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
      }
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/posts/${postId}`,
        requestData, // 수정할 데이터
        {
          withCredentials: true,
          headers: {
            Authorization: tokenWithBearer,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[postService] 게시판 수정 성공:", response.data);

      // 파일 업로드 처리
      if (files && files.length > 0 && response.data.uploadUrls) {
        try {
          await handleFileUpload(response.data, files);
        } catch (uploadError) {
          console.error("[postService] 파일 업로드 중 오류:", uploadError);
          return {
            success: true,
            data: response.data,
            warning: "게시판은 수정되었으나 일부 파일 업로드에 실패했습니다.",
          };
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[postService] 게시판 수정 오류:", error);

      // 권한이 없는 경우 (403)
      if (error.response && error.response.status === 403) {
        return {
          success: false,
          message: "권한이 없습니다. 게시판을 수정할 수 없습니다.",
        };
      }
      return {
        success: false,
        message: error.message || "게시판 수정 중 오류가 발생했습니다.",
      };
    }
  },
};
