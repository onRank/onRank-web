// utils/urlUtils.js

/**
 * S3 URL을 CloudFront 경로로 변환하는 유틸리티 함수
 */

// S3 URL 패턴 정규식
const S3_URL_PATTERN = /^https?:\/\/onrank-file-bucket\.s3\.ap-northeast-2\.amazonaws\.com\/(.+)$/i;

/**
 * S3 URL인지 확인하는 함수
 * @param {string} url - 확인할 URL
 * @returns {boolean} S3 URL 여부
 */
export const isS3Url = (url) => {
  if (!url || typeof url !== 'string') return false;
  return S3_URL_PATTERN.test(url);
};

/**
 * S3 URL을 CloudFront 경로로 변환하는 함수
 * @param {string} url - 변환할 URL
 * @returns {string} 변환된 URL (S3 URL이 아니면 원래 URL 반환)
 */
export const toCdnPath = (url) => {
  if (!url || typeof url !== 'string') return url;
  return isS3Url(url) ? `/${url.replace(S3_URL_PATTERN, '$1')}` : url;
};
