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

/**
 * 이미지를 미리 로드하는 함수
 * 
 * @param {string} imageUrl - 미리 로드할 이미지 URL
 * @returns {Promise<boolean>} 로드 성공 여부
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
    
    // 이미 캐시된 경우 onload가 발생하지 않을 수 있으므로 timeout 설정
    setTimeout(() => resolve(true), 500);
  });
};

/**
 * 이미지 URL에 타임스탬프를 추가하여 캐시를 방지하는 함수
 * 
 * @param {string} imageUrl - 원본 이미지 URL
 * @returns {string} 타임스탬프가 추가된 이미지 URL
 */
export const getUncachedImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  const timestamp = new Date().getTime();
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}t=${timestamp}`;
};

/**
 * 이미지 요소의 src를 새로고침하는 함수
 * 
 * @param {React.RefObject<HTMLImageElement>} imgRef - 이미지 요소에 대한 React ref
 * @param {string} imageUrl - 이미지 URL
 */
export const refreshImageSrc = (imgRef, imageUrl) => {
  if (!imgRef?.current || !imageUrl) return;
  
  imgRef.current.src = getUncachedImageUrl(imageUrl);
};

/**
 * CloudFront 이미지 URL 로딩을 처리하는 통합 함수
 * 
 * @param {string} s3Url - S3 URL
 * @param {function} setImageUrl - 이미지 URL 상태 설정 함수
 * @param {string} studyId - 스터디 ID (캐싱용)
 * @returns {Promise<string|null>} 로드된 이미지 URL 또는 null
 */
export const handleImageLoading = async (s3Url, setImageUrl, studyId) => {
  if (!s3Url) return null;
  
  try {
    // S3 URL을 CloudFront URL로 변환
    const cloudFrontUrl = convertToCloudFrontUrl(s3Url);
    
    // 이미지 미리 로드
    const success = await preloadImage(cloudFrontUrl);
    
    if (success) {
      // URL 상태 업데이트 및 캐싱
      setImageUrl(cloudFrontUrl);
      if (studyId) {
        saveImageUrlToCache(studyId, cloudFrontUrl);
      }
      return cloudFrontUrl;
    }
    
    return null;
  } catch (error) {
    console.error('이미지 로딩 처리 실패:', error);
    return null;
  }
};

/**
 * CORS 이슈를 피하기 위해 이미지를 외부 링크로 렌더링하는 컴포넌트 대신 사용할 URL을 생성
 * 
 * @param {string} imageUrl - 원본 이미지 URL
 * @returns {JSX.Element} 이미지를 표시하는 JSX 요소
 */
export const getSafeImageUrl = (imageUrl) => {
  if (!imageUrl) return DEFAULT_IMAGE_URL;
  
  // CORS 문제를 피하기 위해 URL을 수정
  // 1. 타임스탬프 추가
  const timestampedUrl = getUncachedImageUrl(imageUrl);
  
  // 2. URL을 복사하여 반환
  return timestampedUrl;
};

/**
 * 이미지 URL을 직접 사용하는 대신 이미지를 div 배경으로 표시하는 스타일을 생성
 * 
 * @param {string} imageUrl - 이미지 URL
 * @returns {Object} 배경 이미지 스타일 객체
 */
export const getBackgroundImageStyle = (imageUrl) => {
  if (!imageUrl) return {};
  
  const safeUrl = getSafeImageUrl(imageUrl);
  
  return {
    backgroundImage: `url(${safeUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
}; 