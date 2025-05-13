import { api, tokenUtils } from "./api";
import axios from "axios";
import { studyContextService } from "./studyContext";
import { 
  handleFileUploadWithS3, 
  extractUploadUrlFromResponse,
  uploadFileToS3 
} from "../utils/fileUtils";

export const postService = {
  // 게시글 목록 조회
  getPosts: async (studyId, params = {}) => {
    try {
      console.log("[PostService] 게시글 목록 조회 요청:", studyId);

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

      console.log("[Token Debug] Retrieved token from localStorage:", tokenWithBearer.substring(0, 20) + "...");
        
      console.log("[API Request Debug] GET /studies/" + studyId + "/posts", {
        headers: tokenWithBearer ? "Bearer token present" : "No token",
        data: undefined
      });

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
        
        // 스터디 컨텍스트 서비스를 통해 역할 정보 업데이트
        if (memberContext && studyId) {
          studyContextService.updateFromApiResponse(studyId, responseData);
        }
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
          "[PostService] postTitle 존재 여부:",
          "postTitle" in dataArray[0]
        );
        console.log(
          "[PostService] postContent 존재 여부:",
          "postContent" in dataArray[0]
        );

        // 데이터 필드명 확인 및 일관성 유지
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

          // 제목이 없는 경우 (postTitle 또는 title 필드 확인)
          if (!processedPost.postTitle && processedPost.title) {
            processedPost.postTitle = processedPost.title;
          } else if (
            !processedPost.postTitle ||
            processedPost.postTitle.trim() === ""
          ) {
            console.warn(
              "[PostService] postTitle 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedPost.postTitle = "제목 없음";
          }

          // 내용이 없는 경우 (postContent 또는 content 필드 확인)
          if (!processedPost.postContent && processedPost.content) {
            processedPost.postContent = processedPost.content;
          } else if (
            !processedPost.postContent ||
            processedPost.postContent.trim() === ""
          ) {
            console.warn(
              "[PostService] postContent 필드 없음 또는 빈 값, 기본값 설정"
            );
            processedPost.postContent = "내용 없음";
          }

          // 생성일이 없는 경우
          if (!processedPost.postCreatedAt && processedPost.createdAt) {
            processedPost.postCreatedAt = processedPost.createdAt;
          } else if (!processedPost.postCreatedAt) {
            console.warn(
              "[PostService] postCreatedAt 필드 없음, 현재 시간으로 설정"
            );
            processedPost.postCreatedAt = new Date().toISOString();
          }

          // 수정일이 없는 경우
          if (!processedPost.postModifiedAt && processedPost.modifiedAt) {
            processedPost.postModifiedAt = processedPost.modifiedAt;
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

      // 응답이 { memberContext, data } 구조인지 확인
      let postData = response.data;
      let memberContext = null;

      if (response.data?.data !== undefined) {
        postData = response.data.data;
        memberContext = response.data.memberContext || null;
        
        // 스터디 컨텍스트 서비스를 통해 역할 정보 업데이트
        if (memberContext && studyId) {
          studyContextService.updateFromApiResponse(studyId, response.data);
        }
      }

      // 단일 게시글 데이터 처리
      if (postData) {
        // 필드명 표준화
        if (!postData.postId && postData.id) {
          postData.postId = postData.id;
        }
        
        if (!postData.postTitle && postData.title) {
          postData.postTitle = postData.title;
        }
        
        if (!postData.postContent && postData.content) {
          postData.postContent = postData.content;
        }

        if (!postData.postCreatedAt && postData.createdAt) {
          postData.postCreatedAt = postData.createdAt;
        }

        if (!postData.postModifiedAt && postData.modifiedAt) {
          postData.postModifiedAt = postData.modifiedAt;
        }
      }

      return {
        success: true,
        data: postData,
        memberContext: memberContext,
      };
    } catch (error) {
      console.error(`[PostService] 게시글 상세 조회 오류:`, error);
      return {
        success: false,
        message: error.message || "게시글을 불러오는 중 오류가 발생했습니다",
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
      console.log("[PostService] 유지할 파일 ID 수:", postData.remainingFileIds && postData.remainingFileIds.length);
      
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
        newFileNames: postData.newFileNames || [], // 새로운 파일명
      };
      
      console.log("[PostService] 최종 요청 데이터:", requestData);
      console.log("[PostService] 유지할 파일 ID:", requestData.remainingFileIds);
      console.log("[PostService] 새 파일명:", requestData.newFileNames);

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

      console.log("[PostService] 게시글 수정 성공 응답:", response.data);
      
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
          console.log("[PostService] 응답의 memberContext/data 구조 감지");
        } else {
          // 직접 데이터 구조
          result.data = responseData;
          console.log("[PostService] 응답의 직접 데이터 구조 감지");
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
        
        // 파일 목록 확인
        if (!result.data.files) {
          result.data.files = [];
        }
        
        console.log("[PostService] 정제된 응답 데이터:", result.data);
      } else {
        // 기본 응답 데이터 구성
        result.data = {
          postId: parseInt(postId),
          postTitle: postData.postTitle,
          postContent: postData.postContent,
          updatedAt: new Date().toISOString(),
          fileUrls: [],
          files: []
        };
        console.log("[PostService] 응답 데이터 없음, 기본 데이터 생성");
      }
      
      // 파일 업로드 처리
      const files = postData.files || [];
      if (files && files.length > 0) {
        try {
          console.log("[PostService] 파일 업로드 시작, 파일 개수:", files.length);
          
          // 파일 업로드 수행 - 개선된 함수 사용
          const uploadResults = await handleFileUpload(response.data, files);
          
          // 업로드 결과 확인
          const successCount = uploadResults.filter(r => r.success).length;
          console.log(`[PostService] 파일 업로드 완료: ${successCount}/${files.length} 성공`);
          
          // 업로드 실패 있는 경우 경고 추가
          if (successCount < files.length) {
            result.warning = `게시글은 수정되었으나 일부 파일(${files.length - successCount}개)이 업로드되지 않았습니다.`;
          }
          
          // 업로드된 파일 URL을 결과에 추가
          const uploadedUrls = uploadResults
            .filter(r => r.success && r.url)
            .map(r => r.url);
            
          if (uploadedUrls.length > 0) {
            result.data.fileUrls = uploadedUrls;
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
  createPost: async (studyId, newPost, files = []) => {
    try {
      console.log("[PostService] 게시글 생성 요청:", newPost);
      console.log("[PostService] 첨부 파일 수:", files && files.length);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      
      // API 요청 데이터 준비
      const requestData = {
        postTitle: newPost.postTitle || newPost.title || "",
        postContent: newPost.postContent || newPost.content || "",
        fileNames: (files && files.length > 0) ? files.map(file => file.name) : []
      };
      
      console.log("[PostService] 변환된 요청 데이터:", requestData);
      console.log("[PostService] 파일명 배열:", requestData.fileNames);

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
      if (files && files.length > 0) {
        try {
          console.log("[PostService] 파일 업로드 시작, 파일 개수:", files.length);
          
          // 파일 업로드 수행
          const uploadResults = await handleFileUpload(response.data, files);
          
          // 업로드 결과 확인
          const successCount = uploadResults.filter(r => r.success).length;
          console.log(`[PostService] 파일 업로드 완료: ${successCount}/${files.length} 성공`);
          
          // 업로드 실패 있는 경우 경고 추가
          if (successCount < files.length) {
            result.warning = `게시글은 생성되었으나 일부 파일(${files.length - successCount}개)이 업로드되지 않았습니다.`;
          }
          
          // 업로드된 파일 URL을 결과에 추가
          const uploadedUrls = uploadResults
            .filter(r => r.success && r.url)
            .map(r => r.url);
            
          if (uploadedUrls.length > 0) {
            result.data.fileUrls = uploadedUrls;
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
    console.log("[PostService] editPost 호출:", { studyId, postId });
    console.log("[PostService] editPost postData:", postData);
    console.log("[PostService] editPost files:", files.length + "개 파일");
    
    // 파일명 배열 준비
    let newFileNames = [];
    if (files && files.length > 0) {
      newFileNames = files.map(file => file.name);
      console.log("[PostService] 새 파일명 목록:", newFileNames);
    }
    
    // updatePost 호출 전 필요한 데이터 통합
    const completePostData = {
      ...postData,
      files,
      newFileNames
    };
    
    // updatePost 호출
    return postService.updatePost(studyId, postId, completePostData);
  }
};

// 파일 업로드 처리 함수
const handleFileUpload = async (responseData, files) => {
  try {
    console.log("[FileUpload] 파일 업로드 시작, 파일 수:", files.length);
    console.log("[FileUpload] 파일 목록:", files.map(f => f.name));
    console.log("[FileUpload] 응답 데이터:", responseData);

    if (!files || files.length === 0) {
      console.log("[FileUpload] 업로드할 파일이 없어 처리를 건너뜁니다");
      return [];
    }

    if (!responseData) {
      console.error("[FileUpload] API 응답 데이터가 없습니다");
      return [];
    }

    // fileUtils의 handleFileUploadWithS3 함수 사용 (통합된 방식)
    // 여러 가능한 uploadUrl 키 이름 처리
    const possibleUrlKeys = ['uploadUrl', 'presignedUrl', 'url', 'fileUrl'];
    
    // 각 키 이름으로 시도
    let uploadResults = [];
    let successfulUpload = false;
    
    for (const urlKey of possibleUrlKeys) {
      console.log(`[FileUpload] '${urlKey}' 키로 업로드 URL 검색 시도`);
      
      try {
        // 업로드 시도
        uploadResults = await handleFileUploadWithS3(responseData, files, urlKey);
        
        // 성공한 업로드가 있는지 확인
        const successCount = uploadResults.filter(r => r.success).length;
        if (successCount > 0) {
          console.log(`[FileUpload] '${urlKey}' 키 사용 성공: ${successCount}/${files.length} 파일 업로드됨`);
          successfulUpload = true;
          break; // 성공했으므로 루프 종료
        } else {
          console.log(`[FileUpload] '${urlKey}' 키로 업로드 URL 발견되지 않음`);
        }
      } catch (keyError) {
        console.warn(`[FileUpload] '${urlKey}' 키 사용 시도 중 오류:`, keyError);
        // 다음 키로 계속 시도
      }
    }
    
    if (!successfulUpload) {
      console.warn("[FileUpload] 모든 키 시도 실패, 레거시 방식으로 시도");
      
      // 레거시 코드: 이전 방식(백업용)
      let uploadUrls = [];

      // 백엔드 응답 구조 대응: presignedUrls 또는 data 배열 확인
      if (responseData.presignedUrls && responseData.presignedUrls.length > 0) {
        uploadUrls = responseData.presignedUrls;
        console.log("[FileUpload] presignedUrls 필드 발견:", uploadUrls.length);
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // data 배열 탐색
        const uploadUrlsFromData = responseData.data
          .map(item => item.uploadUrl || item.presignedUrl || item.url)
          .filter(url => url); // null/undefined 제거
          
        if (uploadUrlsFromData.length > 0) {
          uploadUrls = uploadUrlsFromData;
          console.log("[FileUpload] data 배열에서 URL 추출:", uploadUrls.length);
        }
      }

      if (uploadUrls.length > 0) {
        console.log("[FileUpload] 레거시 방식으로 업로드 URL 찾음:", uploadUrls.length);
        
        // 각 파일 업로드 처리
        uploadResults = await Promise.all(
          files.map((file, index) => {
            if (index < uploadUrls.length) {
              return uploadFileToS3(uploadUrls[index], file)
                .then(result => ({
                  fileName: file.name,
                  size: file.size,
                  type: file.type,
                  ...result
                }));
            } else {
              return Promise.resolve({
                fileName: file.name,
                success: false,
                message: '업로드 URL 부족'
              });
            }
          })
        );
      } else {
        console.error("[FileUpload] 어떤 방식으로도 업로드 URL을 찾을 수 없음");
        return [];
      }
    }
    
    console.log("[FileUpload] 최종 업로드 결과:", uploadResults);
    return uploadResults;
  } catch (error) {
    console.error("[FileUpload] 파일 업로드 처리 중 오류:", error);
    throw error;
  }
}; 