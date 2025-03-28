import { http, HttpResponse } from "msw";

// 가짜 JWT 토큰 생성
const mockAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken";
const mockRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshToken";

export const handlers = [
  // 구글 OAuth 인증 모킹
  http.get("http://localhost:8080/oauth2/authorization/google*", () => {
    // 구글 로그인 성공 후 콜백 URL로 리다이렉트
    return HttpResponse.redirect(
      "http://localhost:3000/auth/callback?code=mock_code"
    );
  }),

  // 토큰 재발급 처리
  http.get("http://localhost:8080/auth/reissue", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        // 액세스 토큰은 응답 헤더로 반환
        Authorization: `Bearer ${mockAccessToken}`,
        // 리프레시 토큰은 HttpOnly 쿠키로 설정
        "Set-Cookie": `refreshToken=${mockRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
      },
    });
  }),

  // 사용자 정보 조회
  http.get("http://localhost:8080/auth/login/user", () => {
    return HttpResponse.json({
      email: "test@example.com",
      name: "홍길동",
      nickname: "길동이",
      department: "컴퓨터공학과",
      phoneNumber: "01012345678",
    });
  }),

  // 스터디 목록 조회
  http.get("http://localhost:8080/studies", () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "알고리즘 스터디",
        description: "알고리즘 문제 풀이 및 코드 리뷰",
        memberCount: 5,
        status: "모집중",
      },
      {
        id: 2,
        name: "리액트 스터디",
        description: "리액트와 상태관리 라이브러리 학습",
        memberCount: 3,
        status: "진행중",
      },
    ]);
  }),

  // 회원 정보 입력
  http.post("http://localhost:8080/auth/add", () => {
    return HttpResponse.json(
      {
        email: "test@example.com",
        name: "홍길동",
        nickname: "길동이",
        department: "컴퓨터공학과",
        phoneNumber: "01012345678",
      },
      {
        headers: {
          // 액세스 토큰은 응답 헤더로 반환
          Authorization: `Bearer ${mockAccessToken}`,
          // 리프레시 토큰은 HttpOnly 쿠키로 설정
          "Set-Cookie": `refreshToken=${mockRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
        },
      }
    );
  }),

  // 토큰 리프레시
  http.post("http://localhost:8080/auth/reissue-token", () => {
    return HttpResponse.json(
      { message: "Token refreshed" },
      {
        headers: {
          // 액세스 토큰은 응답 헤더로 반환
          Authorization: `Bearer ${mockAccessToken}`,
          // 리프레시 토큰은 HttpOnly 쿠키로 설정
          "Set-Cookie": `refreshToken=${mockRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
        },
      }
    );
  }),

  // 로그아웃
  http.post("http://localhost:8080/auth/logout", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        // 쿠키 삭제
        "Set-Cookie":
          "refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/",
      },
    });
  }),

  // 회원 정보 수정
  http.patch("http://localhost:8080/auth/update", () => {
    return HttpResponse.json({
      email: "test@example.com",
      name: "홍길동",
      nickname: "길동이",
      department: "컴퓨터공학과",
      phoneNumber: "01012345678",
    });
  }),

  http.get("http://localhost:8080/:studyId/notices", () => {
    return HttpResponse.json([
      {
        id: 1,
        title: "공지사항 1",
        content: "공지사항 1 내용",
      },
      {
        id: 2,
        title: "공지사항 2",
        content: "공지사항 2 내용",
      },
      {
        id: 3,
        title: "공지사항 3",
        content: "공지사항 3 내용",
      },
    ]);
  }),

  // 공지사항 목록 조회
  http.get("http://localhost:8080/studies/:studyId/notices", () => {
    return HttpResponse.json([
      {
        noticeId: 1,
        title: "공지사항 1",
        writer: "작성자1",
        createdAt: new Date().toISOString(),
        content: "공지사항 내용 1",
      },
      {
        noticeId: 2,
        title: "공지사항 2",
        writer: "작성자2",
        createdAt: new Date().toISOString(),
        content: "공지사항 내용 2",
      },
      {
        noticeId: 3,
        title: "공지사항 3",
        writer: "작성자3",
        createdAt: new Date().toISOString(),
        content: "공지사항 내용 3",
      },
    ]);
  }),

  // 공지사항 상세 조회
  http.get("http://localhost:8080/studies/:studyId/notices/:noticeId", () => {
    return HttpResponse.json({
      id: 1,
      title: "3월 스터디 일정 안내",
      writer: "홍길동",
      content: "3월 스터디는 매주 화요일 저녁 8시에 진행됩니다...",
      createdAt: "2024-03-19",
      updatedAt: "2024-03-19",
    });
  }),
];
