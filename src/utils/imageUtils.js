/**
 * S3 URL을 CloudFront URL로 변환하는 유틸리티 함수
 * 
 * @param {string} s3Url - S3에서 제공하는 이미지 URL
 * @returns {string} CloudFront를 통한 이미지 URL 또는 원본 URL
 */
export const convertToCloudFrontUrl = (s3Url) => {
  // 백엔드에서 제공하는 URL을 그대로 사용하는 것이 가장 안전
  console.log('imageUtils: 원본 URL:', s3Url);
  
  if (!s3Url) return '';
  
  // URL이 아닌 경우 그대로 반환
  if (!s3Url.startsWith('http')) {
    return s3Url;
  }
  
  // ⚠️ 중요: 대부분의 경우 변환이 필요 없으므로 원본 URL 그대로 반환
  // 특별한 요구사항이 있는 경우에만 아래 코드 활성화
  
  /*
  // CloudFront 도메인
  const cloudFrontDomain = 'https://d37q7cndbbsph5.cloudfront.net';
  
  // 이미 CloudFront URL인 경우 그대로 반환
  if (s3Url.includes(cloudFrontDomain)) {
    return s3Url;
  }
  
  // S3 URL을 CloudFront URL로 변환해야 하는 경우
  try {
    const urlObj = new URL(s3Url);
    const pathname = urlObj.pathname;
    const cloudFrontUrl = `${cloudFrontDomain}${pathname}`;
    console.log('imageUtils: CloudFront URL로 변환:', cloudFrontUrl);
    return cloudFrontUrl;
  } catch (error) {
    console.error('URL 변환 중 오류 발생:', error);
    return s3Url;
  }
  */
  
  // 현재는 변환 없이 원본 URL 그대로 반환
  return s3Url;
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
 * 이미지 URL에 타임스탬프를 추가하여 캐시를 방지하는 함수
 * 
 * @param {string} imageUrl - 원본 이미지 URL
 * @returns {string} 타임스탬프가 추가된 이미지 URL
 */
export const getUncachedImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // blob URL에는 타임스탬프를 추가하지 않음
  if (imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  
  const timestamp = new Date().getTime();
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}t=${timestamp}`;
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
        // 캐싱 로직 제거
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

// localStorage에 이미지 URL 캐싱
export const saveImageUrlToCache = (key, url) => {
  try {
    if (key && url) {
      localStorage.setItem(`image_url_${key}`, url);
    }
  } catch (error) {
    console.error('이미지 URL 캐싱 중 오류 발생:', error);
  }
};

// localStorage에서 이미지 URL 가져오기
export const getImageUrlFromCache = (key) => {
  try {
    if (key) {
      return localStorage.getItem(`image_url_${key}`);
    }
  } catch (error) {
    console.error('캐시된 이미지 URL 가져오기 중 오류 발생:', error);
  }
  return null;
}; 