import { api, tokenUtils } from "./api";
import axios from "axios";

export const postService = {
  // 게시글 목록 조회
  getPosts: async (studyId, params = {}) => {
    try {
      console.log("[PostService] 게시글 목록 조회 요청");

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn(
          "[PostService] 토큰 없음, 게시글 목록 조회 시 인증 문제 가능성"
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

      console.log("[PostService] 게시글 목록 조회 성공:", response.data);

      // 응답이 문자열인 경우 안전하게 처리
      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          console.log("[PostService] 문자열 응답 처리 시도");

          // HTML 응답인 경우 빈 배열 반환
          if (responseData.includes("<!DOCTYPE html>")) {
            console.warn("[PostService] HTML 응답 감지, 빈 배열 반환");
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
            console.error("[PostService] 데이터 파싱 실패:", parseError);
            return {
              success: false,
              message: "데이터 처리 중 오류가 발생했습니다",
              data: [],
            };
          }
        } catch (error) {
          console.error("[PostService] 응답 처리 오류:", error);
          return {
            success: false,
            message: "응답 처리 중 오류가 발생했습니다",
            data: [],
          };
        }
      }

      // 응답이 없거나 유효하지 않은 경우
      if (!responseData) {
        console.warn("[PostService] 유효하지 않은 응답 데이터");
        return {
          success: false,
          message: "유효하지 않은 응답 데이터입니다",
          data: [],
        };
      }

      // 응답이 { memberContext, data } 구조인지 확인
      let postsData = responseData;
      let memberContext = null;

      if (responseData.data !== undefined) {
        console.log(
          "[PostService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        postsData = responseData.data;
        memberContext = responseData.memberContext || null;

        console.log("[PostService] 멤버 컨텍스트:", memberContext);
      }

      // 데이터가 배열인지 확인
      let dataArray = Array.isArray(postsData)
        ? postsData
        : postsData
        ? [postsData]
        : [];

      if (dataArray.length > 0) {
        console.log(
          "[PostService] 첫 번째 게시글 객체 필드:",
          Object.keys(dataArray[0])
        );

        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log(
          "[PostService] postId 존재 여부:",
          "postId" in dataArray[0] || "id" in dataArray[0]
        );
        console.log(
          "[PostService] title 존재 여부:",
          "title" in dataArray[0]
        );
        console.log(
          "[PostService] content 존재 여부:",
          "content" in dataArray[0]
        );

        // 데이터 유효성 검사 및 기본값 설정
        dataArray = dataArray.map((post) => {
          const processedPost = { ...post };

          // postId가 없거나 유효하지 않은 경우
          if (!processedPost.postId && !processedPost.id) {
            console.warn(
              "[PostService] postId/id 필드 없음 또는 유효하지 않음, 임의 ID 설정"
            );
            processedPost.postId = Math.floor(Math.random() * 10000);
          } else if (!processedPost.postId && processedPost.id) {
            processedPost.postId = processedPost.id;
          }

          // boardId -> postId 필드 변환
          if (processedPost.boardId && !processedPost.postId) {
            processedPost.postId = processedPost.boardId;
          }

          // 제목이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedPost.title === undefined ||
            processedPost.title === null ||
            processedPost.title.trim() === ""
          ) {
            console.warn(
              "[PostService] title 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedPost.title = "제목 없음";
          }

          // boardTitle -> title 필드 변환
          if (processedPost.boardTitle && !processedPost.title) {
            processedPost.title = processedPost.boardTitle;
          }

          // 내용이 없거나, null이거나, 빈 문자열인 경우
          if (
            processedPost.content === undefined ||
            processedPost.content === null ||
            processedPost.content.trim() === ""
          ) {
            console.warn(
              "[PostService] content 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedPost.content = "내용 없음";
          }

          // boardContent -> content 필드 변환
          if (processedPost.boardContent && !processedPost.content) {
            processedPost.content = processedPost.boardContent;
          }

          // 생성일이 없는 경우
          if (!processedPost.createdAt) {
            console.warn(
              "[PostService] createdAt 필드 없음, 현재 시간으로 설정"
            );
            processedPost.createdAt = new Date().toISOString();
          }

          // boardCreatedAt -> createdAt 필드 변환
          if (processedPost.boardCreatedAt && !processedPost.createdAt) {
            processedPost.createdAt = processedPost.boardCreatedAt;
          }

          // 작성자 정보가 없는 경우
          if (!processedPost.writer) {
            console.warn(
              "[PostService] writer 필드 없음, 기본값 설정"
            );
            processedPost.writer = "작성자 없음";
          }

          // 파일 URL 배열 확인
          if (!processedPost.fileUrls) {
            processedPost.fileUrls = [];
          }

          return processedPost;
        });
      }

      // 최종 결과 반환
      return {
        success: true,
        data: dataArray,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[PostService] 게시글 목록 조회 오류:", error);
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
  getPostById: async (studyId, postId) => {
    try {
      console.log(`[PostService] 게시글 상세 조회 요청: ${studyId}/posts/${postId}`);

      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      const response = await api.get(`/studies/${studyId}/posts/${postId}`, {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[PostService] 게시글 상세 조회 성공:", response.data);

      if (!response.data) {
        console.warn("[PostService] 응답 데이터 없음");
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
          "[PostService] 새 API 응답 구조 감지 (memberContext/data)"
        );
        data = response.data.data;
        memberContext = response.data.memberContext || null;
      }

      console.log("[PostService] 게시판 상세 응답 구조:", {
        data,
        memberContext,
      });

      // 데이터 유효성 검사 및 기본값 설정
      const processedPost = { ...data };

      // 필수 필드 확인 및 기본값 설정
      if (!processedPost.postId && !processedPost.id) {
        processedPost.postId = parseInt(postId);
      } else if (!processedPost.postId && processedPost.id) {
        processedPost.postId = processedPost.id;
      }

      // boardId -> postId 필드 변환
      if (processedPost.boardId && !processedPost.postId) {
        processedPost.postId = processedPost.boardId;
      }

      // 제목이 없거나, null이거나, 빈 문자열인 경우
      if (
        processedPost.title === undefined ||
        processedPost.title === null ||
        processedPost.title.trim() === ""
      ) {
        console.warn(
          "[PostService] title 필드 없음 또는 빈 값, 기본값 설정"
        );
        processedPost.title = "제목 없음";
      }

      // boardTitle -> title 필드 변환
      if (processedPost.boardTitle && !processedPost.title) {
        processedPost.title = processedPost.boardTitle;
      }

      // 내용이 없거나, null이거나, 빈 문자열인 경우
      if (
        processedPost.content === undefined ||
        processedPost.content === null ||
        processedPost.content.trim() === ""
      ) {
        console.warn(
          "[PostService] content 필드 없음 또는 빈 값, 기본값 설정"
        );
        processedPost.content = "내용 없음";
      }

      // boardContent -> content 필드 변환
      if (processedPost.boardContent && !processedPost.content) {
        processedPost.content = processedPost.boardContent;
      }

      // 생성일이 없는 경우
      if (!processedPost.createdAt) {
        console.warn(
          "[PostService] createdAt 필드 없음, 현재 시간으로 설정"
        );
        processedPost.createdAt = new Date().toISOString();
      }

      // boardCreatedAt -> createdAt 필드 변환
      if (processedPost.boardCreatedAt && !processedPost.createdAt) {
        processedPost.createdAt = processedPost.boardCreatedAt;
      }

      // 작성자 정보가 없는 경우
      if (!processedPost.writer) {
        console.warn(
          "[PostService] writer 필드 없음, 기본값 설정"
        );
        processedPost.writer = "작성자 없음";
      }
      
      // 파일 URL 배열 확인
      if (!processedPost.fileUrls) {
        processedPost.fileUrls = [];
      }

      console.log("[PostService] 가공된 게시글 상세 데이터:", processedPost);

      return {
        success: true,
        data: processedPost,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error("[PostService] 게시글 상세 조회 오류:", error);
      return {
        success: false,
        message:
          error.message || "게시글 정보를 불러오는 중 오류가 발생했습니다.",
        data: null,
      };
    }
  },

  // 게시글 삭제
  deletePost: async (studyId, postId) => {
    try {
      console.log(`[PostService] 게시글 삭제 요청: /studies/${studyId}/posts/${postId}`);

      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[PostService] 토큰 없음, 인증 필요");
        return {
          success: false,
          message: "인증이 필요합니다. 다시 로그인해주세요.",
        };
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청
      const response = await api.delete(`/studies/${studyId}/posts/${postId}`, {
        withCredentials: true,
        headers: {
          Authorization: tokenWithBearer,
          Accept: "application/json",
        },
      });

      console.log("[PostService] 게시글 삭제 성공:", response.data);

      // 성공 응답 반환
      return {
        success: true,
        message: "게시글이 성공적으로 삭제되었습니다.",
        data: response.data
      };
    } catch (error) {
      console.error("[PostService] 게시글 삭제 오류:", error);
      return {
        success: false,
        message: error.message || "게시글 삭제 중 오류가 발생했습니다.",
      };
    }
  },

  // 게시글 수정
  updatePost: async (studyId, postId, postData) => {
    try {
      console.log(`[PostService] 게시글 수정 요청: /studies/${studyId}/posts/${postId}`);
      console.log("[PostService] 수정 데이터:", postData);
      console.log("[PostService] 첨부 파일 수:", postData.files && postData.files.length);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn("[PostService] 토큰 없음, 인증 필요");
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
        postTitle: postData.postTitle,
        postContent: postData.postContent,
        remainingFileIds: postData.remainingFileIds || [], // 남겨둘 파일 ID
        newFileNames: postData.fileNames || [], // 새로운 파일명
      };
      
      console.log("[PostService] 최종 요청 데이터:", requestData);

      // API 요청
      const response = await api.put(
        `/studies/${studyId}/posts/${postId}`,
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

      console.log("[PostService] 게시글 수정 성공:", response.data);
      
      // 성공 응답 처리
      let responseData = response.data;
      let result = {
        success: true,
        message: "게시글이 성공적으로 수정되었습니다.",
      };

      // 응답 데이터 처리
      if (responseData) {
        // 응답 데이터 변환 및 정제
        if (responseData.data) {
          // { memberContext, data } 구조
          result.data = responseData.data;
          result.memberContext = responseData.memberContext;
        } else {
          // 직접 데이터 구조
          result.data = responseData;
        }
        
        // ID와 필드명 처리
        if (!result.data.postId && result.data.id) {
          result.data.postId = result.data.id;
        } else if (result.data.boardId && !result.data.postId) {
          result.data.postId = result.data.boardId;
        }
        
        if (result.data.boardTitle && !result.data.title) {
          result.data.title = result.data.boardTitle;
        }
        
        if (result.data.boardContent && !result.data.content) {
          result.data.content = result.data.boardContent;
        }
        
        if (result.data.postTitle && !result.data.title) {
          result.data.title = result.data.postTitle;
        }
        
        if (result.data.postContent && !result.data.content) {
          result.data.content = result.data.postContent;
        }
        
        if (result.data.boardCreatedAt && !result.data.createdAt) {
          result.data.createdAt = result.data.boardCreatedAt;
        }
        
        // 파일 URL 배열 확인
        if (!result.data.fileUrls) {
          result.data.fileUrls = [];
        }
      } else {
        // 기본 응답 데이터 구성
        result.data = {
          postId: parseInt(postId),
          title: postData.postTitle,
          content: postData.postContent,
          updatedAt: new Date().toISOString(),
          fileUrls: []
        };
      }
      
      // 파일 업로드 처리
      const files = postData.files || [];
      if (files && files.length > 0) {
        try {
          // 응답에 uploadUrls 또는 data 배열이 있는지 확인
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
          result.warning = "게시글은 수정되었으나 일부 파일 업로드에 실패했습니다.";
        }
      }

      return result;
    } catch (error) {
      console.error("[PostService] 게시글 수정 오류:", error);
      return {
        success: false,
        message: error.message || "게시글 수정 중 오류가 발생했습니다.",
      };
    }
  },

  // 게시글 생성
  createPost: async (studyId, newPost) => {
    try {
      console.log("[PostService] 게시글 생성 요청:", newPost);
      console.log("[PostService] 첨부 파일 수:", newPost.files && newPost.files.length);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      
      // API 요청 데이터 준비
      const requestData = {
        postTitle: newPost.postTitle || newPost.title || "",
        postContent: newPost.postContent || newPost.content || "",
        fileNames: newPost.fileNames || [] // 파일 이름 배열 추가
      };
      
      console.log("[PostService] 변환된 요청 데이터:", requestData);

      if (!token) {
        console.error("[PostService] 토큰 없음, 게시글 생성 불가");
        return {
          success: false,
          message: "인증이 필요합니다. 다시 로그인해주세요.",
        };
      }

      const tokenWithBearer = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // API 요청 - 수정된 엔드포인트 사용
      const response = await api.post(
        `/studies/${studyId}/posts/add`,
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

      console.log("[PostService] 게시글 생성 응답:", response.data);
      
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
            console.warn("[PostService] 응답 데이터 파싱 실패:", parseError);
          }
        }

        if (!responseData || Object.keys(responseData).length === 0) {
          console.log("[PostService] 응답 데이터가 비어있음, 기본 데이터 사용");
          
          // 헤더에서 위치 정보 추출해 ID 찾기 시도
          const locationHeader = response.headers.location;
          let postId = null;
          
          if (locationHeader) {
            const match = locationHeader.match(/\/([^\/]+)$/);
            if (match && match[1]) {
              postId = parseInt(match[1]);
            }
          }
          
          result.data = {
            postId: postId || Date.now(),
            postTitle: newPost.postTitle || newPost.title,
            postContent: newPost.postContent || newPost.content,
            postCreatedAt: new Date().toISOString(),
            postWritenBy: "현재 사용자",
            fileUrls: [] // 파일 URL 배열 필드 추가
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
          if (!result.data.postId && result.data.id) {
            result.data.postId = result.data.id;
          } else if (!result.data.postId) {
            result.data.postId = Date.now();
          }
          
          // 필드명 통일 (API 응답의 필드명에 맞게)
          if (result.data.boardId && !result.data.postId) {
            result.data.postId = result.data.boardId;
          }
          
          if (result.data.boardTitle && !result.data.title) {
            result.data.title = result.data.boardTitle;
          }
          
          if (result.data.boardContent && !result.data.content) {
            result.data.content = result.data.boardContent;
          }
          
          if (result.data.postTitle && !result.data.title) {
            result.data.title = result.data.postTitle;
          }
          
          if (result.data.postContent && !result.data.content) {
            result.data.content = result.data.postContent;
          }
          
          if (result.data.boardCreatedAt && !result.data.createdAt) {
            result.data.createdAt = result.data.boardCreatedAt;
          }
          
          // 파일 URL 배열 확인
          if (!result.data.fileUrls) {
            result.data.fileUrls = [];
          }
        }

        console.log("[PostService] 정제된 응답 데이터:", result);
      } catch (processingError) {
        console.error("[PostService] 응답 데이터 처리 오류:", processingError);
      }
      
      // 파일 업로드 처리
      const files = newPost.files || [];
      if (files && files.length > 0) {
        try {
          // 응답에 uploadUrls 또는 data 배열이 있는지 확인
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
          result.warning = "게시글은 생성되었으나 일부 파일 업로드에 실패했습니다.";
        }
      }

      return result;
    } catch (error) {
      console.error("[PostService] 게시글 생성 오류:", error);
      return {
        success: false,
        message: error.message || "게시글 생성 중 오류가 발생했습니다.",
      };
    }
  },
  
  // editPost 함수 추가 (updatePost의 별칭으로 사용)
  editPost: async (studyId, postId, postData, files = []) => {
    return postService.updatePost(studyId, postId, {
      ...postData,
      files: files
    });
  }
};

// 파일 업로드 처리 함수
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

          // 파일 유형에 따라 적절한 업로드 함수 선택
          if (file.type.startsWith("image/")) {
            await ImageUploadToS3(uploadUrl, file);
            console.log(`[FileUpload] 이미지 '${file.name}' 업로드 성공`);
          } else {
            await FileUploadToS3(uploadUrl, file);
            console.log(`[FileUpload] 파일 '${file.name}' 업로드 성공`);
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

// 이미지 업로드 함수
const ImageUploadToS3 = async (presignedUrl, imageFile) => {
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
};

// 파일 업로드 함수
const FileUploadToS3 = async (presignedUrl, file) => {
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
}; 