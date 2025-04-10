/**
 * S3 URL을 CloudFront URL로 변환하는 유틸리티 함수
 * 
 * @param {string} s3Url - S3에서 제공하는 이미지 URL
 * @returns {string} CloudFront를 통한 이미지 URL
 */
export const convertToCloudFrontUrl = (s3Url) => {
  if (!s3Url) return '';
  
  // CloudFront 도메인
  const cloudFrontDomain = 'https://d37q7cndbbsph5.cloudfront.net';
  
  try {
    // 'study' 키워드 위치 찾기 - S3 URL에는 항상 '/study/' 경로가 포함됨
    const studyIndex = s3Url.indexOf('/study/');
    
    if (studyIndex !== -1) {
      // '/study/1/file.png' 형태로 경로 추출
      const objectPath = s3Url.substring(studyIndex);
      console.log('원본 URL:', s3Url);
      console.log('추출된 경로:', objectPath);
      
      // CloudFront URL 생성
      const cloudFrontUrl = `${cloudFrontDomain}${objectPath}`;
      console.log('CloudFront URL:', cloudFrontUrl);
      
      return cloudFrontUrl;
    }
    
    // 기존 방식 (fallback)
    const urlObj = new URL(s3Url);
    const pathname = urlObj.pathname;
    console.log('원본 URL:', s3Url);
    console.log('추출된 경로 (fallback):', pathname);
    return `${cloudFrontDomain}${pathname}`;
    
  } catch (error) {
    console.error('URL 변환 오류:', error);
    // 오류 발생 시 원래 URL 반환
    return s3Url;
  }
};

/**
 * 이미지 URL이 유효한지 확인하는 함수
 * 
 * @param {string} url - 확인할 이미지 URL
 * @returns {Promise<boolean>} URL이 유효한 이미지를 가리키는지 여부
 */
export const isImageUrlValid = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// 이미지 URL이 없을 때 사용할 기본 이미지
export const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/300x200?text=No+Image'; 

/**
 * 스터디 이미지 URL을 localStorage에 저장하는 함수
 * 
 * @param {string} studyId - 스터디 ID
 * @param {string} imageUrl - 저장할 이미지 URL
 * @returns {void}
 */
export const saveImageUrlToCache = (studyId, imageUrl) => {
  if (!studyId || !imageUrl) return;
  
  // blob URL은 캐싱하지 않음 (로컬 파일 선택 시 생성되는 임시 URL)
  if (imageUrl.startsWith('blob:')) return;
  
  try {
    const cacheKey = `study_image_${studyId}`;
    console.log(`이미지 URL 캐싱: ${cacheKey}`, imageUrl);
    localStorage.setItem(cacheKey, imageUrl);
  } catch (error) {
    console.error('이미지 URL 캐싱 실패:', error);
  }
};

/**
 * localStorage에서 스터디 이미지 URL을 가져오는 함수
 * 
 * @param {string} studyId - 스터디 ID
 * @returns {string|null} 캐시된 이미지 URL 또는 null
 */
export const getImageUrlFromCache = (studyId) => {
  if (!studyId) return null;
  
  try {
    const cacheKey = `study_image_${studyId}`;
    const cachedUrl = localStorage.getItem(cacheKey);
    
    if (cachedUrl) {
      console.log(`캐시된 이미지 URL 사용: ${cacheKey}`, cachedUrl);
      return cachedUrl;
    }
    
    return null;
  } catch (error) {
    console.error('캐시된 이미지 URL 조회 실패:', error);
    return null;
  }
}; 