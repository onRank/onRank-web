// 브라우저 콘솔에서 실행할 디버깅 코드
function checkCookies() {
  console.log('=== 모든 쿠키 확인 ===');
  console.log(document.cookie);
  
  // 모든 쿠키를 객체로 변환
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name) acc[name] = value;
    return acc;
  }, {});
  
  console.log('쿠키 객체:', cookies);
  console.log('refresh_token 존재 여부:', 'refresh_token' in cookies);
  
  // HttpOnly 쿠키는 JS에서 접근 불가능하므로 간접적으로 확인
  console.log('로컬 스토리지 토큰:', localStorage.getItem('accessToken'));
}

// 실행
checkCookies(); 