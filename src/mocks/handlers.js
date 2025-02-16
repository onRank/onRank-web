import { http, HttpResponse } from 'msw'

// 가짜 JWT 토큰 생성
const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken'

export const handlers = [
  // 구글 로그인 시작
  http.get('http://localhost:8080/auth', () => {
    return HttpResponse.json({
      isNewUser: true,
      redirectUrl: '/auth/add?isNewUser=true'
    })
  }),

  // 콜백 처리
  http.get('http://localhost:8080/auth/callback', () => {
    return HttpResponse.json(
      { isNewUser: true },
      {
        headers: {
          'Set-Cookie': [
            `Authorization=${mockJwtToken}; HttpOnly; Secure; SameSite=Strict`,
            `JSESSIONID=mock-session-id; HttpOnly; Secure; SameSite=Strict`
          ]
        }
      }
    )
  }),

  // 사용자 정보 조회
  http.get('http://localhost:8080/auth/login/user', () => {
    return HttpResponse.json({
      email: 'test@example.com',
      name: '홍길동',
      nickname: '길동이',
      department: '컴퓨터공학과',
      phoneNumber: '01012345678'
    })
  }),

  // 스터디 목록 조회
  http.get('http://localhost:8080/studies', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: '알고리즘 스터디',
        members: 5,
        status: '모집중'
      },
      {
        id: 2,
        title: '리액트 스터디',
        members: 3,
        status: '진행중'
      }
    ])
  }),

  // 회원 정보 입력
  http.post('http://localhost:8080/auth/add', () => {
    // ...
  }),

  // 토큰 리프레시
  http.post('http://localhost:8080/auth/reissue-token', () => {
    // ...
  }),

  // 로그아웃
  http.post('http://localhost:8080/auth/logout', () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        // 쿠키 삭제
        'Set-Cookie': [
          'Authorization=; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
          'JSESSIONID=; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
        ]
      }
    })
  }),

  // 회원 정보 수정
  http.patch('http://localhost:8080/auth/update', () => {
    // ...
  })
] 