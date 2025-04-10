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
    console.log("[imageUtils] S3 이미지 업로드 시작:", {
      uploadUrl: uploadUrl.substring(0, 100) + "...",
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });

    // PUT 요청으로 S3에 직접 업로드
    await axios.put(uploadUrl, imageFile, {
      headers: {
        "Content-Type": imageFile.type,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log("[imageUtils] S3 이미지 업로드 완료");
    return true;
  } catch (error) {
    console.error("[imageUtils] S3 이미지 업로드 실패:", error);
    throw new Error(
      "이미지 업로드에 실패했습니다: " + (error.message || "알 수 없는 오류")
    );
  }
}; 