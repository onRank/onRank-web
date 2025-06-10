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
 * 파일이 이미지인지 확인
 * @param {string|Object} file - 파일 이름 문자열 또는 File 객체
 * @returns {boolean} 이미지 파일 여부
 */
export const isImageFile = (file) => {
  // File 객체인 경우
  if (file instanceof File || (file && typeof file === 'object' && file.type)) {
    // MIME 타입으로 판단
    return file.type.startsWith('image/');
  }
  
  // 문자열(파일명)인 경우
  if (typeof file === 'string') {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }
  
  // 파일 객체에서 fileName 속성 사용
  if (file && typeof file === 'object' && file.fileName) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const ext = file.fileName.toLowerCase().substring(file.fileName.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }
  
  return false;
};

/**
 * 파일 미리보기 URL 생성
 * @param {File|Object} file - File 객체 또는 파일 정보가 담긴 객체
 * @returns {string|null} 미리보기 URL 또는 null
 */
export const getFilePreviewUrl = (file) => {
  if (!file) return null;
  
  // 이미지 파일이 아니면 null 반환
  if (!isImageFile(file)) return null;
  
  // 파일이 File 객체일 경우 (새로 첨부된 파일)
  if (file instanceof File || (file instanceof Blob)) {
    return URL.createObjectURL(file);
  }
  
  // 파일 객체가 fileUrl 속성을 가진 경우 (기존 파일)
  if (file.fileUrl) {
    return file.fileUrl;
  }
  
  // 파일 객체에 name이 있고 url이 있는 경우
  if (file.name && file.url) {
    return file.url;
  }
  
  return null;
};

/**
 * 파일 미리보기 URL 생성 시 메모리 해제
 * @param {string} previewUrl - URL.createObjectURL로 생성된 URL
 */
export const revokeFilePreviewUrl = (previewUrl) => {
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
};

/**
 * 파일 또는 파일 목록의 미리보기 정보 생성
 * 컴포넌트에서 사용하기 위한 형태로 데이터 변환
 * 
 * @param {File|Object|Array} files - 파일 객체 또는 파일 객체 배열
 * @returns {Array} 미리보기 정보가 포함된 파일 객체 배열
 */
export const prepareFilePreviewsData = (files) => {
  if (!files) return [];
  
  // 단일 파일을 배열로 변환
  const fileArray = Array.isArray(files) ? files : [files];
  
  return fileArray.map(file => {
    // 기본 파일 정보
    const fileInfo = {
      id: file.fileId || file.id || Math.random().toString(36).substr(2, 9),
      name: file.fileName || file.name || 'unnamed',
      size: file.fileSize || file.size || 0,
      type: file.fileType || file.type || '',
      isImage: isImageFile(file),
      originalFile: file
    };
    
    // 이미지 파일인 경우 미리보기 URL 추가
    if (fileInfo.isImage) {
      fileInfo.previewUrl = getFilePreviewUrl(file);
    }
    
    return fileInfo;
  });
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
      console.error('[uploadFileToS3] 유효하지 않은 업로드 URL:', uploadUrl);
      return { success: false, message: '업로드 URL이 유효하지 않습니다.' };
    }
    
    // 파일 유효성 검사
    if (!file || !(file instanceof File)) {
      console.error('[uploadFileToS3] 유효하지 않은 파일 객체:', file);
      return { success: false, message: '유효하지 않은 파일입니다.' };
    }
    
    console.log(`[uploadFileToS3] 파일 업로드 시작: ${file.name} (${formatFileSize(file.size)})`);
    console.log(`[uploadFileToS3] 업로드 URL: ${uploadUrl}`);
    
    // 프리사인드 URL에서 Content-Type 추출
    let contentType = file.type || "application/octet-stream";
    
    // URL에서 Content-Type 파라미터가 있는지 확인
    try {
      const urlObj = new URL(uploadUrl);
      
      // 로깅: URL 구조 확인
      console.log(`[uploadFileToS3] URL 구문 분석:`, {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        search: urlObj.search,
      });
      
      const params = new URLSearchParams(urlObj.search);
      if (params.has("Content-Type")) {
        contentType = params.get("Content-Type");
        console.log(`[uploadFileToS3] 프리사인드 URL에서 추출한 Content-Type 사용: ${contentType}`);
      }
    } catch (urlError) {
      console.warn("[uploadFileToS3] URL 파싱 실패, 파일 타입 사용:", urlError);
    }
    
    console.log(`[uploadFileToS3] 파일 업로드 요청 설정:`, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      fileType: file.type,
      fileName: file.name,
      fileSize: formatFileSize(file.size)
    });
    
    // axios를 사용하여 업로드 - 바이너리 데이터 처리가 더 안정적임
    try {
      const axios = window.axios || require('axios');
      
      const response = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': contentType
        }
      });
      
      console.log(`[uploadFileToS3] axios 응답 상태:`, {
        status: response.status,
        statusText: response.statusText
      });
      
      // S3 업로드 URL로부터 다운로드 URL 가져오기
      const fileUrl = uploadUrl.split('?')[0];
      console.log(`[uploadFileToS3] 파일 업로드 성공: ${file.name} -> ${fileUrl}`);
      
      return {
        success: true,
        message: '파일이 성공적으로 업로드되었습니다.',
        url: fileUrl
      };
    } catch (axiosError) {
      console.error('[uploadFileToS3] axios 업로드 실패:', axiosError);
      
      // axios 업로드 실패 시 fetch로 대체 시도
      console.log('[uploadFileToS3] fetch API로 대체 시도...');
      
      const requestOptions = {
        method: 'PUT',
        body: file,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': contentType
        }
      };
      
      const fetchResponse = await fetch(uploadUrl, requestOptions);
      
      // 응답 로깅
      console.log(`[uploadFileToS3] fetch 응답 상태:`, {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        ok: fetchResponse.ok
      });
      
      if (!fetchResponse.ok) {
        let errorDetails;
        try {
          errorDetails = await fetchResponse.text();
          console.error('[uploadFileToS3] 응답 상세 정보:', errorDetails);
        } catch (textError) {
          errorDetails = '응답 상세 정보를 읽을 수 없음';
        }
        
        return { 
          success: false, 
          message: `파일 업로드 실패: ${fetchResponse.status} ${fetchResponse.statusText}`,
          error: errorDetails
        };
      }
      
      // S3 업로드 URL로부터 다운로드 URL 가져오기
      const fileUrl = uploadUrl.split('?')[0];
      console.log(`[uploadFileToS3] 파일 업로드 성공 (fetch 사용): ${file.name} -> ${fileUrl}`);
      
      return {
        success: true,
        message: '파일이 성공적으로 업로드되었습니다.',
        url: fileUrl
      };
    }
  } catch (error) {
    console.error('[uploadFileToS3] 파일 업로드 중 예외 발생:', error);
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

/**
 * API 응답에서 업로드 URL 추출
 * @param {Object} response - API 응답 객체
 * @param {string} searchKey - 찾을 키 이름 (uploadUrl, presignedUrl 등)
 * @param {boolean} extractMultiple - 여러 URL을 배열로 추출할지 여부
 * @returns {string|Array|null} 찾은 업로드 URL(들) 또는 null
 */
export const extractUploadUrlFromResponse = (response, searchKey = 'uploadUrl', extractMultiple = false) => {
  // 응답이 null이거나 undefined인 경우
  if (!response) {
    console.warn('[FileUtils] 응답이 null이거나 undefined입니다.');
    return extractMultiple ? [] : null;
  }
  
  // 응답이 직접 URL인 경우
  if (typeof response === 'string') {
    console.log('[FileUtils] 응답이 직접 URL 문자열입니다.');
    return extractMultiple ? [response] : response;
  }
  
  console.log('[FileUtils] URL 추출 시작, 찾는 키:', searchKey);
  
  // 업로드 URL 프로퍼티 이름 목록 - 검색할 다양한 가능성 추가
  const possibleKeys = [
    searchKey,
    'uploadUrl',
    'presignedUrl',
    'preSignedUrl',
    'url',
    'fileUploadUrl',
    's3UploadUrl'
  ];
  
  // 응답에서 uploadUrls 배열 직접 검색 (최상위)
  if (response.uploadUrls && Array.isArray(response.uploadUrls) && response.uploadUrls.length > 0) {
    console.log('[FileUtils] 최상위에서 uploadUrls 배열 발견:', response.uploadUrls.length);
    return extractMultiple ? response.uploadUrls : response.uploadUrls[0];
  }
  
  // data 배열이 있는 새로운 응답 구조 처리
  if (response.data && Array.isArray(response.data)) {
    console.log('[FileUtils] data 배열에서 URL 검색, 항목 수:', response.data.length);
    
    // 각 항목에서 가능한 키 목록으로 URL 찾기
    const urls = [];
    for (const item of response.data) {
      // 모든 가능한 키 이름으로 검색
      for (const key of possibleKeys) {
        if (item[key]) {
          console.log(`[FileUtils] data 배열 항목에서 ${key} 발견`);
          urls.push(item[key]);
          break; // 첫 번째 발견된 URL 키만 사용
        }
      }
    }
    
    if (urls.length > 0) {
      console.log(`[FileUtils] data 배열에서 ${urls.length}개 URL 발견`);
      return extractMultiple ? urls : urls[0]; // 여러 URL 또는 첫 번째 URL 반환
    }
  }
  
  // 응답이 객체인 경우 searchKey 검색
  if (typeof response === 'object') {
    // 직접 키가 있는지 확인 - 가능한 모든 키 이름으로 검색
    for (const key of possibleKeys) {
      if (response[key]) {
        console.log(`[FileUtils] 최상위에서 ${key} 발견`);
        return extractMultiple ? [response[key]] : response[key];
      }
    }
    
    // data 객체 확인
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      console.log('[FileUtils] data 객체에서 URL 검색');
      
      // data 내의 가능한 키 이름으로 검색
      for (const key of possibleKeys) {
        if (response.data[key]) {
          console.log(`[FileUtils] data 객체에서 ${key} 발견`);
          return extractMultiple ? [response.data[key]] : response.data[key];
        }
      }
    }
    
    // 재귀적으로 중첩된 객체 내부 검색
    let foundUrls = [];
    
    for (const key in response) {
      if (typeof response[key] === 'object' && response[key] !== null) {
        console.log(`[FileUtils] '${key}' 속성 내부 검색`);
        const nestedResult = extractUploadUrlFromResponse(response[key], searchKey, extractMultiple);
        
        if (nestedResult) {
          if (extractMultiple) {
            // 배열이면 합치고, 아니면 배열에 추가
            foundUrls = foundUrls.concat(Array.isArray(nestedResult) ? nestedResult : [nestedResult]);
            console.log(`[FileUtils] '${key}' 속성에서 URL 발견, 총 ${foundUrls.length}개`);
          } else {
            console.log(`[FileUtils] '${key}' 속성에서 URL 발견`);
            return nestedResult; // 단일 URL 검색 시 첫 번째 발견된 URL 반환
          }
        }
      }
    }
    
    // 여러 URL 추출 모드에서 URL이 있으면 반환
    if (extractMultiple && foundUrls.length > 0) {
      console.log(`[FileUtils] 재귀 검색으로 총 ${foundUrls.length}개 URL 발견`);
      return foundUrls;
    }
  }
  
  console.warn('[FileUtils] 응답에서 URL을 찾을 수 없음');
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
  
  console.log('[FileUtils] API 응답 데이터 구조 확인:', JSON.stringify(responseData, null, 2));
  
  // 업로드 URL 추출
  const uploadUrls = extractUploadUrlFromResponse(responseData, urlKeyName, true);
  
  console.log('[FileUtils] 추출된 업로드 URL:', uploadUrls);
  
  if (!uploadUrls || uploadUrls.length === 0) {
    console.warn('[FileUtils] 업로드 URL을 찾을 수 없습니다. 응답 구조:', Object.keys(responseData));
    
    // data 객체가 있는지 확인 
    if (responseData.data) {
      console.log('[FileUtils] data 객체 내용:', responseData.data);
      
      // data 객체 내의 첫 번째 항목 확인
      if (Array.isArray(responseData.data) && responseData.data.length > 0) {
        console.log('[FileUtils] data 배열 첫 항목 구조:', Object.keys(responseData.data[0]));
      }
    }
    
    return files.map(file => ({
      fileName: file.name,
      success: false,
      message: '업로드 URL을 찾을 수 없습니다.'
    }));
  }
  
  console.log(`[FileUtils] ${uploadUrls.length}개의 업로드 URL을 발견했습니다.`);
  console.log(`[FileUtils] 첫 번째 URL 샘플:`, uploadUrls[0].substring(0, 100) + '...');
  
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
    
    if (isS3Url) {
      console.log(`[fileUtils] S3 URL 감지: ${url}`);
      
      // 프록시 서버를 통한 다운로드 시도 (CORS 문제 해결을 위함)
      const downloadViaProxy = async () => {
        // 백엔드 API 경로가 있으면 사용
        if (window.API_BASE_URL) {
          try {
            const encodedFileUrl = encodeURIComponent(url);
            const proxyUrl = `${window.API_BASE_URL}/api/files/download?url=${encodedFileUrl}&fileName=${encodeURIComponent(fileName)}`;
            
            console.log(`[fileUtils] 백엔드 프록시 사용: ${proxyUrl}`);
            
            // 새 창에서 다운로드
            window.open(proxyUrl, '_blank');
            return true;
          } catch (proxyError) {
            console.error('[fileUtils] 프록시 다운로드 실패:', proxyError);
            return false;
          }
        }
        return false;
      };
      
      // 직접 S3에서 다운로드 시도
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          },
          // 크로스 도메인 요청을 위한 설정
          credentials: 'omit',
          mode: 'cors'
        });
        
        if (!response.ok) {
          console.warn(`[fileUtils] S3 직접 다운로드 실패 (${response.status}): ${response.statusText}`);
          // 직접 다운로드 실패시 프록시 시도
          if (await downloadViaProxy()) return;
          throw new Error(`S3 다운로드 실패: ${response.status} ${response.statusText}`);
        }
        
        // 응답을 Blob으로 변환
        const blob = await response.blob();
        
        // Blob URL 생성 및 다운로드
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        
        // DOM에 링크 추가하고 클릭
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 메모리 누수 방지
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
        
        console.log(`[fileUtils] S3 다운로드 성공: ${fileName}`);
        return;
      } catch (s3Error) {
        console.error('[fileUtils] S3 직접 다운로드 오류:', s3Error);
        
        // 직접 다운로드 실패시 프록시 시도
        if (await downloadViaProxy()) return;
        
        // 마지막 대안으로 URL 직접 열기
        window.open(url, '_blank');
        console.log('[fileUtils] 새 창에서 URL 직접 열기 시도');
        return;
      }
    }
    
    // 일반 URL 다운로드 처리
    try {
      // 일반 URL 직접 다운로드
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
      
      console.log(`[fileUtils] 일반 URL 다운로드 성공: ${fileName}`);
    } catch (error) {
      console.error('[fileUtils] 일반 URL 다운로드 실패:', error);
      
      // 직접 URL 열기 시도
      window.open(url, '_blank');
      console.log('[fileUtils] 새 창에서 열기 시도');
    }
  } catch (error) {
    console.error('[fileUtils] 다운로드 중 예상치 못한 오류:', error);
    alert(`파일 다운로드에 실패했습니다. 다시 시도해주세요.`);
  }
};

// 이미지 유틸리티 함수 재내보내기 (imageUtils.js에서 가져옴)
export * from './imageUtils'; 