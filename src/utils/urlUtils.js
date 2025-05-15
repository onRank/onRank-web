// utils/urlUtils.js

/**
 * 1) S3 정적 URL을 CloudFront 경로(/study…, /notice…)로 변환
 * 2) 프리사인 URL(?X-Amz-…) 은 그대로 두어 서명이 깨지지 않게 함
 */

const S3_URL_RE = /^https?:\/\/onrank-file-bucket\.s3\.ap-northeast-2\.amazonaws\.com\/(.+)$/i;

// 프리사인 URL 여부 검사 ─ 서명 파라미터가 포함돼 있으면 True
const isPresigned = (u = '') =>
  /[?&]X-Amz-Algorithm=/.test(u) || /[?&]X-Amz-Signature=/.test(u);

/** 주어진 문자열이 S3 버킷 정적 URL인가?  */
export const isS3Url = (url) => S3_URL_RE.test(url);

/** S3 URL → /study/…, /notice/… 경로로, 프리사인은 그대로 반환 */
export const toCdnPath = (url) => {
  if (typeof url !== 'string' || !url) return url;
  if (isPresigned(url)) return url;                 // 예외: 프리사인 URL
  return isS3Url(url) ? `/${url.replace(S3_URL_RE, '$1')}` : url;
};
