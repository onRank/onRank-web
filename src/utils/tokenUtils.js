// 토큰 관리를 위한 유틸리티 함수들
export const tokenUtils = {
  // 토큰 저장
  setToken: (token) => {
    if (token) {
      // localStorage에 저장
      try {
        localStorage.setItem('accessToken', token);
        
        // sessionStorage에도 백업 저장
        try {
          sessionStorage.setItem('accessToken_backup', token);
          console.log('[TokenUtils] 토큰 및 백업 토큰 저장 성공');
        } catch (backupError) {
          console.warn('[TokenUtils] 백업 토큰 저장 실패:', backupError);
        }
        
        return true;
      } catch (error) {
        console.error('[TokenUtils] 토큰 저장 실패:', error);
        
        // localStorage 실패 시 sessionStorage에만이라도 저장 시도
        try {
          sessionStorage.setItem('accessToken_backup', token);
          console.log('[TokenUtils] localStorage 실패, sessionStorage에 백업 저장 성공');
          return true;
        } catch (backupError) {
          console.error('[TokenUtils] 모든 스토리지에 토큰 저장 실패');
          return false;
        }
      }
    }
    return false;
  },

  // 토큰 가져오기
  getToken: () => {
    // 1. localStorage에서 먼저 확인
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      return localToken;
    }
    
    // 2. localStorage에 없으면 sessionStorage 백업 확인
    const backupToken = sessionStorage.getItem('accessToken_backup');
    if (backupToken) {
      console.log('[TokenUtils] localStorage에 토큰 없음, 백업 토큰 사용');
      
      // 가능하면 localStorage에 복원
      try {
        localStorage.setItem('accessToken', backupToken);
        console.log('[TokenUtils] 백업 토큰을 localStorage에 복원 성공');
      } catch (e) {
        console.warn('[TokenUtils] 백업 토큰 복원 실패, 백업만 사용:', e);
      }
      
      return backupToken;
    }
    
    // 3. 토큰이 어디에도 없으면 null 반환
    return null;
  },

  // 토큰 제거
  removeToken: (removeBackup = false) => {
    // localStorage 토큰 제거
    try {
      localStorage.removeItem('accessToken');
    } catch (e) {
      console.warn('[TokenUtils] localStorage 토큰 제거 실패:', e);
    }
    
    // removeBackup이 true면 백업 토큰도 제거
    if (removeBackup) {
      try {
        sessionStorage.removeItem('accessToken_backup');
        console.log('[TokenUtils] 백업 토큰도 제거 완료');
      } catch (e) {
        console.warn('[TokenUtils] 백업 토큰 제거 실패:', e);
      }
    }
    
    // 리다이렉트 여부 확인
    if (arguments.length > 1 && arguments[1] === true) {
      window.location.href = '/login';
    }
  },

  // 토큰 유효성 검사
  isTokenValid: () => {
    // 1. 먼저 localStorage 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          return true;
        }
      } catch (error) {
        console.error('[TokenUtils] 토큰 검증 실패:', error);
      }
    }
    
    // 2. 백업 토큰 확인
    const backupToken = sessionStorage.getItem('accessToken_backup');
    if (backupToken) {
      try {
        const payload = JSON.parse(atob(backupToken.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          // 유효한 백업 토큰을 localStorage에 복원 시도
          try {
            localStorage.setItem('accessToken', backupToken);
            console.log('[TokenUtils] 유효한 백업 토큰 복원 성공');
          } catch (e) {
            console.warn('[TokenUtils] 유효한 백업 토큰 복원 실패:', e);
          }
          return true;
        }
      } catch (backupError) {
        console.error('[TokenUtils] 백업 토큰 검증 실패:', backupError);
      }
    }
    
    return false;
  },
  
  // 백업 토큰 관리 함수들
  backupToken: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        sessionStorage.setItem('accessToken_backup', token);
        console.log('[TokenUtils] 토큰 백업 성공');
        return true;
      } catch (e) {
        console.error('[TokenUtils] 토큰 백업 실패:', e);
        return false;
      }
    }
    return false;
  },
  
  restoreFromBackup: () => {
    const backupToken = sessionStorage.getItem('accessToken_backup');
    if (backupToken) {
      try {
        localStorage.setItem('accessToken', backupToken);
        console.log('[TokenUtils] 백업에서 토큰 복원 성공');
        return true;
      } catch (e) {
        console.error('[TokenUtils] 백업에서 토큰 복원 실패:', e);
        return false;
      }
    }
    return false;
  }
}; 