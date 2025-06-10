/**
 * 이미지 URL 관련 유틸리티 함수
 */
import axios from 'axios';
import { isS3Url as isS3UrlFromUtils, toCdnPath } from './urlUtils';

/**
 * 이미지 URL을 직접 사용하는 대신 이미지를 div 배경으로 표시하는 스타일을 생성
 * 
 * @param {string} imageUrl - 이미지 URL
 * @returns {Object} 배경 이미지 스타일 객체
 */
export const getBackgroundImageStyle = (imageUrl) => {
  if (!imageUrl) return {};
  
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
}; 

/**
 * 이미지 로드 실패 시 사용할 기본 SVG 이미지 URL
 */
export const DEFAULT_IMAGE_SVG = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22150%22%20fill%3D%22%23CCCCCC%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%2275%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20fill%3D%22%23333333%22%3E%EC%8A%A4%ED%84%B0%EB%94%94%20%EC%9D%B4%EB%AF%B8%EC%A7%80%3C%2Ftext%3E%3C%2Fsvg%3E';

/**
 * S3 URL인지 확인하는 유틸리티 함수
 * 
 * @param {string} url - 확인할 URL
 * @returns {boolean} S3 URL 여부
 */
export const isS3Url = (url) => {
  // urlUtils.js에서 가져온 함수 사용
  return isS3UrlFromUtils(url);
};

/**
 * 이미지 로드 오류 시 기본 이미지로 대체하는 이벤트 핸들러
 * 
 * @param {React.SyntheticEvent} e - 이벤트 객체
 * @param {string} imageInfo - 로그에 표시할 이미지 정보
 */
export const handleImageError = (e, imageInfo = '') => {
  // 이미 기본 이미지로 대체된 경우 무한 루프를 방지
  if (e.target.src === DEFAULT_IMAGE_SVG) {
    console.log(`[이미지 로딩] 이미 기본 이미지 사용 중`);
    return;
  }
  
  console.log(`[이미지 로딩 실패] 기본 이미지로 대체: ${imageInfo}`);
  
  // src 속성을 기본 이미지로 변경
  e.target.src = DEFAULT_IMAGE_SVG;
  // 추가 오류 방지
  e.target.onerror = null;
}; 

/**
 * S3에 이미지를 직접 업로드하는 함수
 * 
 * @param {string} uploadUrl - 백엔드에서 받은 pre-signed URL
 * @param {File} imageFile - 업로드할 이미지 파일 객체
 * @returns {Promise<boolean>} 업로드 성공 여부
 */
export const uploadImageToS3 = async (uploadUrl, imageFile) => {
  try {
    console.log("[imageUtils] S3 이미지 업로드 시작 - 함수 호출됨");
    
    // URL 유효성 검사
    if (!uploadUrl || typeof uploadUrl !== 'string') {
      console.error("[imageUtils] 유효하지 않은 uploadUrl:", uploadUrl);
      throw new Error("유효하지 않은 업로드 URL");
    }

    // 파일 유효성 검사
    if (!imageFile || !(imageFile instanceof File)) {
      console.error("[imageUtils] 유효하지 않은 imageFile:", imageFile);
      throw new Error("유효하지 않은 이미지 파일");
    }
    
    console.log("[imageUtils] 업로드 준비:", {
      url: uploadUrl.substring(0, 100) + "...",
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });

    console.log("[imageUtils] PUT 요청 직전");
    
    // PUT 요청으로 S3에 직접 업로드
    const uploadConfig = {
      headers: {
        "Content-Type": imageFile.type || 'application/octet-stream',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };
    
    console.log("[imageUtils] 업로드 설정:", uploadConfig);
    
    const response = await axios.put(uploadUrl, imageFile, uploadConfig);
    
    console.log("[imageUtils] S3 업로드 응답:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    console.log("[imageUtils] S3 이미지 업로드 완료");
    return true;
  } catch (error) {
    console.error("[imageUtils] S3 이미지 업로드 실패:", error);
    console.error("[imageUtils] 오류 세부 정보:", {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request ? "요청 객체 있음" : "요청 객체 없음"
    });
    
    throw new Error(
      "이미지 업로드에 실패했습니다: " + (error.message || "알 수 없는 오류")
    );
  }
}; 

/**
 * 스터디 이미지 업로드 처리 함수 - 백엔드 응답에서 uploadUrl 추출 및 S3 업로드
 * 
 * @param {Object} response - 백엔드 API 응답 (PUT /api/studies/{studyId})
 * @param {File} imageFile - 업로드할 이미지 파일
 * @returns {Object} - 업로드 결과 객체 {success, message, fileUrl}
 */
export const handleStudyImageUpload = async (response, imageFile) => {
  try {
    console.log("[handleStudyImageUpload] 함수 시작");
    
    // response가 axios 응답인지 또는 이미 data 객체인지 확인
    const responseData = response.data ? response.data : response;
    
    console.log("[handleStudyImageUpload] 응답 데이터 확인:", responseData);
    
    // 응답 데이터 검증
    if (!responseData) {
      console.error("[handleStudyImageUpload] 응답 데이터가 없음");
      return { success: false, message: "응답 데이터가 없습니다" };
    }
    
    // 받은 응답 구조 분석
    console.log("[handleStudyImageUpload] 응답 데이터 구조:", {
      responseType: typeof responseData,
      isObject: responseData !== null && typeof responseData === 'object',
      topLevelKeys: responseData !== null && typeof responseData === 'object' ? Object.keys(responseData) : [],
      hasMemberContext: !!(responseData && responseData.memberContext),
      hasDataObject: !!(responseData && responseData.data),
      responsePartial: JSON.stringify(responseData).substring(0, 500) + "..."
    });
    
    // 가능한 모든 경로에서 uploadUrl 찾기
    let uploadUrl = null;
    
    // 재귀적으로 객체를 탐색하여 uploadUrl 키를 찾는 함수
    const findUploadUrl = (obj, depth = 0, maxDepth = 5) => {
      if (!obj || typeof obj !== 'object' || depth > maxDepth) return null;
      
      // 직접 uploadUrl 키를 가진 경우
      if (obj.uploadUrl) {
        console.log(`[handleStudyImageUpload] depth ${depth}에서 uploadUrl 발견`);
        return obj.uploadUrl;
      }
      
      // 중첩된 객체에서 찾기
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const found = findUploadUrl(obj[key], depth + 1, maxDepth);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    // 일반적인 위치에서 먼저 확인
    if (responseData.data && responseData.data.uploadUrl) {
      console.log("[handleStudyImageUpload] responseData.data.uploadUrl에서 발견");
      uploadUrl = responseData.data.uploadUrl;
    } else if (responseData.uploadUrl) {
      console.log("[handleStudyImageUpload] responseData.uploadUrl에서 발견");
      uploadUrl = responseData.uploadUrl;
    } else if (responseData.memberContext && responseData.memberContext.uploadUrl) {
      console.log("[handleStudyImageUpload] responseData.memberContext.uploadUrl에서 발견");
      uploadUrl = responseData.memberContext.uploadUrl;
    } else {
      // 재귀 탐색으로 찾기
      uploadUrl = findUploadUrl(responseData);
    }
    
    // uploadUrl 존재 여부 검증
    if (!uploadUrl) {
      console.error("[handleStudyImageUpload] uploadUrl을 찾을 수 없음");
      console.log("[handleStudyImageUpload] 전체 응답 구조:", JSON.stringify(responseData).substring(0, 1000));
      return { 
        success: false, 
        message: "업로드 URL을 찾을 수 없습니다" 
      };
    }
    
    console.log("[handleStudyImageUpload] 찾은 uploadUrl:", uploadUrl.substring(0, 100) + "...");
    
    // 이미지 파일 확인
    if (!imageFile) {
      console.error("[handleStudyImageUpload] 이미지 파일이 없음");
      return { success: false, message: "업로드할 이미지 파일이 없습니다" };
    }
    
    // S3 업로드 실행
    console.log("[handleStudyImageUpload] S3 업로드 시작");
    await uploadImageToS3(uploadUrl, imageFile);
    console.log("[handleStudyImageUpload] S3 업로드 완료");
    
    // 파일 URL 추출 (구조에 따라 다를 수 있음)
    let fileUrl = null;
    
    // 재귀적으로 객체를 탐색하여 fileUrl 키를 찾는 함수
    const findFileUrl = (obj, depth = 0, maxDepth = 5) => {
      if (!obj || typeof obj !== 'object' || depth > maxDepth) return null;
      
      // 직접 fileUrl 키를 가진 경우
      if (obj.fileUrl) {
        console.log(`[handleStudyImageUpload] depth ${depth}에서 fileUrl 발견`);
        return obj.fileUrl;
      }
      
      // 일반적인 API 응답 구조의 file 객체 확인
      if (obj.file && obj.file.fileUrl) {
        console.log(`[handleStudyImageUpload] depth ${depth}의 file 객체에서 fileUrl 발견`);
        return obj.file.fileUrl;
      }
      
      // 중첩된 객체에서 찾기
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const found = findFileUrl(obj[key], depth + 1, maxDepth);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    // 일반적인 위치에서 먼저 확인
    if (responseData.memberContext && responseData.memberContext.file && responseData.memberContext.file.fileUrl) {
      fileUrl = responseData.memberContext.file.fileUrl;
    } else if (responseData.data && responseData.data.fileUrl) {
      fileUrl = responseData.data.fileUrl;
    } else {
      // 재귀 탐색으로 찾기
      fileUrl = findFileUrl(responseData);
    }
    
    // 이미지 URL이 S3 URL인 경우 그대로 반환
    return {
      success: true,
      message: "이미지가 성공적으로 업로드되었습니다",
      fileUrl: fileUrl
    };
  } catch (error) {
    console.error("[handleStudyImageUpload] 이미지 업로드 처리 에러:", error);
    console.error("[handleStudyImageUpload] 오류 세부 정보:", {
      message: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      message: "이미지 업로드 중 오류가 발생했습니다: " + error.message,
    };
  }
}; 

/**
 * 이미지 파일 입력 변경 핸들러
 * 
 * @param {Event} e - 파일 입력 이벤트
 * @returns {Object} - 선택된 파일과 미리보기 URL
 */
export const handleImageFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    console.log("이미지 파일 선택됨:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 이미지 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    
    return { 
      file, 
      previewUrl 
    };
  }
  
  return { file: null, previewUrl: null };
};