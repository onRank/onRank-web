/**
 * 파일 관련 유틸리티 함수
 */

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 * @param {number} bytes - 바이트 단위 파일 크기
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 형식화된 파일 크기 (예: 1.5 MB)
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * 파일 이름에 따라 적절한 아이콘(이모지)을 반환
 * @param {string} fileName - 파일 이름
 * @returns {string} 파일 타입에 맞는 이모지
 */
export const getFileIcon = (fileName) => {
  const extension = getFileExtension(fileName);
  
  // 파일 타입별 아이콘
  switch (extension) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📑';
    case 'txt': return '📃';
    case 'zip':
    case 'rar': return '🗜️';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg': return '🖼️';
    case 'mp4':
    case 'mov':
    case 'avi': return '🎬';
    case 'mp3':
    case 'wav': return '🎵';
    default: return '📁';
  }
};

/**
 * 파일 이름에서 확장자 추출
 * @param {string} fileName - 파일 이름
 * @returns {string} 소문자로 변환된 확장자
 */
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

/**
 * S3 사전 서명된 URL을 사용하여 파일을 S3에 업로드
 * @param {string} uploadUrl - S3 사전 서명된 URL
 * @param {File} file - 업로드할 파일 객체
 * @returns {Promise<{success: boolean, message: string, url?: string}>} 업로드 결과
 */
export const uploadFileToS3 = async (uploadUrl, file) => {
  try {
    // URL 유효성 검사
    if (!uploadUrl || typeof uploadUrl !== 'string') {
      console.error('Invalid upload URL:', uploadUrl);
      return { success: false, message: '업로드 URL이 유효하지 않습니다.' };
    }
    
    // 파일 유효성 검사
    if (!file || !(file instanceof File)) {
      console.error('Invalid file object:', file);
      return { success: false, message: '유효하지 않은 파일입니다.' };
    }
    
    console.log(`파일 업로드 시작: ${file.name} (${formatFileSize(file.size)})`);
    
    // 프리사인드 URL에서 Content-Type 추출
    let contentType = file.type || "application/octet-stream";

    // URL에서 Content-Type 파라미터가 있는지 확인
    try {
      const urlObj = new URL(uploadUrl);
      const params = new URLSearchParams(urlObj.search);
      if (params.has("Content-Type")) {
        contentType = params.get("Content-Type");
        console.log(`[uploadFileToS3] 프리사인드 URL에서 추출한 Content-Type 사용: ${contentType}`);
      }
    } catch (urlError) {
      console.warn("[uploadFileToS3] URL 파싱 실패, 파일 타입 사용:", urlError);
    }
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('File upload failed:', errorText);
      return { 
        success: false, 
        message: `파일 업로드 실패: ${response.status} ${response.statusText}`,
        error: errorText 
      };
    }
    
    // S3 업로드 URL로부터 다운로드 URL 가져오기
    // 일반적으로 사전 서명된 PUT URL에서 쿼리 파라미터를 제거하면 다운로드 URL을 얻을 수 있음
    const fileUrl = uploadUrl.split('?')[0];
    console.log(`파일 업로드 성공: ${file.name}`);
    
    return {
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      url: fileUrl
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return {
      success: false,
      message: `파일 업로드 중 오류가 발생했습니다: ${error.message}`,
      error
    };
  }
};

/**
 * 여러 파일을 S3에 업로드
 * @param {Array<{file: File, uploadUrl: string}>} filesWithUrls - 파일과 업로드 URL 쌍의 배열
 * @returns {Promise<Array<{fileName: string, success: boolean, message: string, url?: string}>>} 업로드 결과 배열
 */
export const uploadFilesToS3 = async (filesWithUrls) => {
  const results = [];
  
  for (const { file, uploadUrl } of filesWithUrls) {
    const result = await uploadFileToS3(uploadUrl, file);
    results.push({
      fileName: file.name,
      size: file.size,
      type: file.type,
      ...result
    });
  }
  
  return results;
};

/**
 * API 응답에서 업로드 URL 추출
 * @param {Object} response - API 응답 객체
 * @param {string} searchKey - 찾을 키 이름 (uploadUrl, presignedUrl 등)
 * @param {boolean} extractMultiple - 여러 URL을 배열로 추출할지 여부
 * @returns {string|Array|null} 찾은 업로드 URL(들) 또는 null
 */
export const extractUploadUrlFromResponse = (response, searchKey = 'uploadUrl', extractMultiple = false) => {
  // 응답이 null이거나 undefined인 경우
  if (!response) return extractMultiple ? [] : null;
  
  // 응답이 직접 URL인 경우
  if (typeof response === 'string') return extractMultiple ? [response] : response;
  
  // data 배열이 있는 새로운 응답 구조 처리
  if (response.data && Array.isArray(response.data)) {
    // data 배열에서 uploadUrl 추출
    const urls = response.data
      .map(item => item[searchKey])
      .filter(url => url); // undefined나 null 제거
    
    if (urls.length > 0) {
      return extractMultiple ? urls : urls[0]; // 여러 URL 또는 첫 번째 URL 반환
    }
  }
  
  // 응답이 객체인 경우 searchKey 검색
  if (typeof response === 'object') {
    // 직접 키가 있는지 확인
    if (response[searchKey]) return extractMultiple ? [response[searchKey]] : response[searchKey];
    
    // 재귀적으로 중첩된 객체 내부 검색
    let foundUrls = [];
    
    for (const key in response) {
      if (typeof response[key] === 'object' && response[key] !== null) {
        const nestedResult = extractUploadUrlFromResponse(response[key], searchKey, extractMultiple);
        
        if (nestedResult) {
          if (extractMultiple) {
            // 배열이면 합치고, 아니면 배열에 추가
            foundUrls = foundUrls.concat(Array.isArray(nestedResult) ? nestedResult : [nestedResult]);
          } else {
            return nestedResult; // 단일 URL 검색 시 첫 번째 발견된 URL 반환
          }
        }
      }
    }
    
    // 여러 URL 추출 모드에서 URL이 있으면 반환
    if (extractMultiple && foundUrls.length > 0) {
      return foundUrls;
    }
  }
  
  return extractMultiple ? [] : null;
};

/**
 * API 응답에서 업로드 URL을 추출하고 여러 파일을 S3에 업로드
 * @param {Object} responseData - API 응답 데이터 (uploadUrl을 포함)
 * @param {File[]} files - 업로드할 파일 배열
 * @param {string} urlKeyName - 응답에서 업로드 URL이 저장된 키 이름 (기본값: 'uploadUrl')
 * @returns {Promise<Array<{fileName: string, success: boolean, message: string, url?: string}>>} 업로드 결과 배열
 */

//여러 개의 file들을 S3에 업로드하는 함수
export const handleFileUploadWithS3 = async (responseData, files, urlKeyName = 'uploadUrl') => {
  if (!files || files.length === 0) {
    console.log('[FileUtils] 업로드할 파일이 없습니다.');
    return [];
  }
  
  if (!responseData) {
    console.error('[FileUtils] API 응답 데이터가 없습니다.');
    return files.map(file => ({
      fileName: file.name,
      success: false,
      message: 'API 응답 데이터가 없습니다.'
    }));
  }
  
  // 업로드 URL 추출
  const uploadUrls = extractUploadUrlFromResponse(responseData, urlKeyName, true);
  
  if (!uploadUrls || uploadUrls.length === 0) {
    console.warn('[FileUtils] 업로드 URL을 찾을 수 없습니다.');
    return files.map(file => ({
      fileName: file.name,
      success: false,
      message: '업로드 URL을 찾을 수 없습니다.'
    }));
  }
  
  console.log(`[FileUtils] ${uploadUrls.length}개의 업로드 URL을 발견했습니다.`);
  
  // 파일 수와 URL 수가 일치하지 않을 수 있음을 경고
  if (uploadUrls.length !== files.length) {
    console.warn(`[FileUtils] 파일 수(${files.length})와 업로드 URL 수(${uploadUrls.length})가 일치하지 않습니다.`);
  }
  
  // 파일별로 업로드 URL 매핑하여 업로드
  const uploadPromises = files.map((file, index) => {
    if (index < uploadUrls.length) {
      console.log(`[FileUtils] 파일 "${file.name}"의 업로드 URL 확인됨`);
      return uploadFileToS3(uploadUrls[index], file)
        .then(result => ({
          fileName: file.name,
          size: file.size,
          type: file.type,
          ...result
        }));
    }
    return Promise.resolve({
      fileName: file.name,
      size: file.size,
      type: file.type,
      success: false,
      message: '업로드 URL이 충분하지 않습니다.'
    });
  });
  
  // 모든 파일 업로드 대기
  const uploadResults = await Promise.all(uploadPromises);
  console.log('[FileUtils] 파일 업로드 결과:', uploadResults);
  
  // 업로드 실패 발생 시 경고
  const failedUploads = uploadResults.filter(result => !result.success);
  if (failedUploads.length > 0) {
    console.warn('[FileUtils] 일부 파일 업로드 실패:', failedUploads);
  }
  
  return uploadResults;
};

/**
 * 파일을 Base64 인코딩 문자열로 변환
 * @param {File} file - 변환할 파일 객체
 * @returns {Promise<string>} Base64 인코딩된 문자열
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * URL에서 파일 다운로드
 * @param {string} url - 다운로드할 파일 URL
 * @param {string} fileName - 저장할 파일 이름
 */
export const downloadFile = async (url, fileName) => {
  try {
    console.log(`[fileUtils] 파일 다운로드 시작: ${fileName} (${url})`);
    
    // S3 URL 여부 확인 (amazonaws.com 도메인 체크)
    const isS3Url = url.includes('amazonaws.com') || url.includes('s3.');
    
    // S3 URL인 경우 백엔드 프록시 API 경로로 변환 (선택적 구현)
    if (isS3Url && window.API_BASE_URL) {
      // 원래 URL을 인코딩하여 백엔드에 전달
      const encodedFileUrl = encodeURIComponent(url);
      const proxyUrl = `${window.API_BASE_URL}/api/files/download?url=${encodedFileUrl}&fileName=${encodeURIComponent(fileName)}`;
      
      console.log(`[fileUtils] S3 URL 감지, 백엔드 프록시 사용 시도: ${proxyUrl}`);
      
      // 백엔드 프록시를 통한 다운로드 시도
      window.open(proxyUrl, '_blank');
      
      // 다운로드 시작됨을 사용자에게 알림
      console.log(`[fileUtils] 백엔드 프록시를 통한 다운로드 시작됨`);
      return;
    }
    
    // 직접 다운로드 (fetch API 사용)
    try {
      // S3에 요청할 때는 Authorization 헤더를 명시적으로 제거
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        },
        // 기존 인증 정보를 전송하지 않음
        credentials: 'omit'
      });
      
      // 응답이 성공적인지 확인
      if (!response.ok) {
        console.warn(`[fileUtils] 직접 다운로드 실패 (${response.status})`);
        throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
      }
      
      // 응답을 Blob으로 변환
      const blob = await response.blob();
      
      // Blob URL 생성
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // 다운로드 링크 생성 및 클릭
      const blobLink = document.createElement('a');
      blobLink.href = downloadUrl;
      blobLink.download = fileName;
      
      document.body.appendChild(blobLink);
      blobLink.click();
      document.body.removeChild(blobLink);
      
      // 메모리 누수 방지를 위해 URL 해제
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      console.log(`[fileUtils] 직접 다운로드 성공: ${fileName}`);
    } catch (directError) {
      console.error('[fileUtils] 직접 다운로드 중 오류:', directError);
      throw directError;
    }
    
  } catch (error) {
    console.error('[fileUtils] 파일 다운로드 중 오류:', error);
    
    // 사용자에게 오류 알림
    alert(`파일 다운로드에 실패했습니다. 나중에 다시 시도해 주세요.`);
    
    // 다른 방법으로 링크 열기 시도 (대안책)
    try {
      window.open(url, '_blank');
      console.log('[fileUtils] 새 창에서 열기로 대체');
    } catch (fallbackError) {
      console.error('[fileUtils] 대체 열기 실패:', fallbackError);
    }
  }
};

// 이미지 유틸리티 함수 재내보내기 (imageUtils.js에서 가져옴)
export * from './imageUtils'; 