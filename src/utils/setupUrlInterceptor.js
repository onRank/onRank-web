/**
 * URL 인터셉터 설정
 * S3 URL을 자동으로 CloudFront 경로로 변환
 */

import { toCdnPath } from './urlUtils';
import axios from 'axios';

/**
 * native fetch API를 가로채서 S3 URL을 CloudFront 경로로 변환
 */
const setupFetchInterceptor = () => {
  console.log('[URLInterceptor] 네이티브 fetch API 인터셉터 설정');
  
  // 원본 fetch 함수 저장
  const originalFetch = window.fetch;
  
  // fetch 함수 재정의
  window.fetch = (input, init) => {
    // URL 변환
    if (typeof input === 'string') {
      const convertedUrl = toCdnPath(input);
      if (convertedUrl !== input) {
        console.log(`[URLInterceptor] URL 변환: ${input.substring(0, 50)}... -> ${convertedUrl.substring(0, 50)}...`);
        input = convertedUrl;
      }
    } else if (input instanceof Request) {
      const originalUrl = input.url;
      const convertedUrl = toCdnPath(originalUrl);
      
      if (convertedUrl !== originalUrl) {
        console.log(`[URLInterceptor] Request URL 변환: ${originalUrl.substring(0, 50)}... -> ${convertedUrl.substring(0, 50)}...`);
        // 새 Request 객체 생성
        input = new Request(convertedUrl, input);
      }
    }
    
    // 원본 fetch 호출
    return originalFetch(input, init);
  };
};

/**
 * axios 인터셉터 설정
 */
const setupAxiosInterceptor = () => {
  console.log('[URLInterceptor] axios 인터셉터 설정');
  
  // 요청 인터셉터 추가
  axios.interceptors.request.use(
    (config) => {
      if (config.url) {
        const originalUrl = config.url;
        const convertedUrl = toCdnPath(originalUrl);
        
        if (convertedUrl !== originalUrl) {
          console.log(`[URLInterceptor] axios URL 변환: ${originalUrl.substring(0, 50)}... -> ${convertedUrl.substring(0, 50)}...`);
          config.url = convertedUrl;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

/**
 * XHR 요청 인터셉터 설정 (일부 라이브러리 호환성을 위해)
 */
const setupXhrInterceptor = () => {
  console.log('[URLInterceptor] XHR 인터셉터 설정');
  
  const originalOpen = XMLHttpRequest.prototype.open;
  
  XMLHttpRequest.prototype.open = function(...args) {
    if (args.length > 1 && typeof args[1] === 'string') {
      const originalUrl = args[1];
      const convertedUrl = toCdnPath(originalUrl);
      
      if (convertedUrl !== originalUrl) {
        console.log(`[URLInterceptor] XHR URL 변환: ${originalUrl.substring(0, 50)}... -> ${convertedUrl.substring(0, 50)}...`);
        args[1] = convertedUrl;
      }
    }
    
    return originalOpen.apply(this, args);
  };
};

/**
 * 모든 인터셉터 초기화
 */
export const initializeUrlInterceptors = () => {
  try {
    setupFetchInterceptor();
    setupAxiosInterceptor();
    setupXhrInterceptor();
    console.log('[URLInterceptor] 모든 URL 인터셉터가 성공적으로 초기화되었습니다.');
  } catch (error) {
    console.error('[URLInterceptor] 인터셉터 초기화 중 오류 발생:', error);
  }
};

// 자동 초기화 (이 파일이 import될 때 실행)
initializeUrlInterceptors(); 