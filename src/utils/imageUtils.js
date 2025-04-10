/**
 * 이미지 URL 관련 유틸리티 함수
 */
import axios from 'axios';

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
 * 이미지 로드 오류 시 기본 이미지로 대체하는 이벤트 핸들러
 * 
 * @param {React.SyntheticEvent} e - 이벤트 객체
 * @param {string} imageInfo - 로그에 표시할 이미지 정보
 */
export const handleImageError = (e, imageInfo = '') => {
  e.target.src = DEFAULT_IMAGE_SVG;
  console.log(`[이미지 로딩 실패] 대체 이미지 사용: ${imageInfo}`);
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
    console.log("[handleStudyImageUpload] 응답 데이터 확인:", response);
    
    // 응답 데이터 검증
    if (!response || !response.data) {
      console.error("[handleStudyImageUpload] 응답 데이터가 없음:", response);
      return { success: false, message: "응답 데이터가 없습니다" };
    }
    
    // 받은 응답 구조 분석
    console.log("[handleStudyImageUpload] 응답 데이터 구조:", {
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasMemberContext: !!(response.data && response.data.memberContext),
      hasDataObject: !!(response.data && response.data.data),
      responseStructure: JSON.stringify(response.data).substring(0, 500) + "..."
    });
    
    // 가능한 모든 경로에서 uploadUrl 찾기
    let uploadUrl = null;
    
    // 구조 1: response.data.data.uploadUrl
    if (response.data.data && response.data.data.uploadUrl) {
      console.log("[handleStudyImageUpload] 구조 1에서 uploadUrl 발견");
      uploadUrl = response.data.data.uploadUrl;
    } 
    // 구조 2: response.data.uploadUrl
    else if (response.data.uploadUrl) {
      console.log("[handleStudyImageUpload] 구조 2에서 uploadUrl 발견");
      uploadUrl = response.data.uploadUrl;
    }
    // 다른 가능한 구조들 확인
    else {
      console.warn("[handleStudyImageUpload] 일반적인 구조에서 uploadUrl을 찾을 수 없음");
      
      // 응답 데이터 전체를 순회하며 uploadUrl 키를 찾음
      const findUploadUrl = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        
        if (obj.uploadUrl) return obj.uploadUrl;
        
        for (const key in obj) {
          if (typeof obj[key] === 'object') {
            const found = findUploadUrl(obj[key]);
            if (found) return found;
          }
        }
        
        return null;
      };
      
      uploadUrl = findUploadUrl(response.data);
      
      if (uploadUrl) {
        console.log("[handleStudyImageUpload] 재귀 탐색에서 uploadUrl 발견");
      }
    }
    
    // uploadUrl 존재 여부 검증
    if (!uploadUrl) {
      console.error("[handleStudyImageUpload] uploadUrl을 찾을 수 없음");
      console.log("[handleStudyImageUpload] 전체 응답 구조:", JSON.stringify(response.data).substring(0, 1000));
      return { 
        success: false, 
        message: "업로드 URL을 찾을 수 없습니다" 
      };
    }
    
    console.log("[handleStudyImageUpload] 찾은 uploadUrl:", uploadUrl.substring(0, 100) + "...");
    
    // 이미지 파일 확인
    if (!imageFile) {
      console.error("[handleStudyImageUpload] 이미지 파일이 없음");
      return { success: false, message: "업로드할's3-access 이미지 파일이 없습니다" };
    }
    
    console.log("[handleStudyImageUpload] 업로드할 이미지 파일:", {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      lastModified: new Date(imageFile.lastModified).toISOString()
    });
    
    // S3 업로드 실행
    console.log("[handleStudyImageUpload] S3 업로드 시작");
    await uploadImageToS3(uploadUrl, imageFile);
    console.log("[handleStudyImageUpload] S3 업로드 완료");
    
    // 파일 URL 추출 (구조에 따라 다를 수 있음)
    let fileUrl = null;
    
    // 구조 1: response.data.memberContext.file.fileUrl
    if (response.data.memberContext && response.data.memberContext.file && response.data.memberContext.file.fileUrl) {
      fileUrl = response.data.memberContext.file.fileUrl;
    } 
    // 구조 2: response.data.data.fileUrl
    else if (response.data.data && response.data.data.fileUrl) {
      fileUrl = response.data.data.fileUrl;
    }
    // 다른 가능한 구조들 확인
    else {
      // 응답 데이터 전체를 순회하며 fileUrl 키를 찾음
      const findFileUrl = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        
        if (obj.fileUrl) return obj.fileUrl;
        
        for (const key in obj) {
          if (typeof obj[key] === 'object') {
            const found = findFileUrl(obj[key]);
            if (found) return found;
          }
        }
        
        return null;
      };
      
      fileUrl = findFileUrl(response.data);
    }
    
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