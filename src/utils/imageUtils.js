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
    // S3 URL 예시: https://onrank-bucket.s3.ap-northeast-2.amazonaws.com/study/1/file.png
    const urlObj = new URL(s3Url);
    
    // /onrank-bucket/study/1/file.png 또는 /study/1/file.png 형태로 추출
    const fullPath = urlObj.pathname;
    
    // 버킷 이름을 제외한 실제 객체 경로 추출 (/study/1/file.png)
    let objectPath = fullPath;
    
    // URL 패턴에서 버킷 이름이 포함된 경우 처리
    if (fullPath.startsWith('/')) {
      // 첫 번째 슬래시 이후 다음 슬래시까지가 버킷 이름일 수 있음
      const secondSlashIndex = fullPath.indexOf('/', 1);
      if (secondSlashIndex !== -1) {
        // 버킷 이름 이후의 경로만 추출
        objectPath = fullPath.substring(secondSlashIndex);
      }
    }
    
    // onrank-bucket.s3.ap...com/study/1/file.png 형태인 경우
    // pathname은 /study/1/file.png 형태로 추출됨
    
    console.log('원본 URL:', s3Url);
    console.log('추출된 경로:', objectPath);
    
    // CloudFront URL 생성
    const cloudFrontUrl = `${cloudFrontDomain}${objectPath}`;
    console.log('CloudFront URL:', cloudFrontUrl);
    
    return cloudFrontUrl;
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