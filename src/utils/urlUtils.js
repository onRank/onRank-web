// utils/urlUtils.js
export const toCdnPath = (s3Url) => {
  if (!s3Url) return s3Url;

  // S3 도메인 패턴과 study 이하 경로 추출
  const m = s3Url.match(
    /^https?:\/\/onrank-file-bucket\.s3\.ap-northeast-2\.amazonaws\.com\/(.+)$/
  );
  return m ? `/${m[1]}` : s3Url;   // 못 맞으면 원본 그대로
};
