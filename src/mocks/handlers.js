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

  // 스터디 멤버 조회
  http.get("http://localhost:8080/studies/:studyId/management/members", () => {
    return HttpResponse.json([
      {
        memberId: 1,
        studentName: "홍길동",
        studentEmail: "hong@example.com",
        memberRole: "HOST",
      },
      {
        memberId: 2,
        studentName: "김철수",
        studentEmail: "kim@example.com",
        memberRole: "PARTICIPANT",
      },
      {
        memberId: 3,
        studentName: "이영희",
        studentEmail: "lee@example.com",
        memberRole: "PARTICIPANT",
      },
      {
        memberId: 4,
        studentName: "박지성",
        studentEmail: "park@example.com",
        memberRole: "PARTICIPANT",
      },
    ]);
  }),

  // 스터디 멤버 역할 변경
  http.put(
    "http://localhost:8080/studies/:studyId/management/members/:memberId/role",
    async ({ params, request }) => {
      const { studyId, memberId } = params;
      const { role } = await request.json();

      console.log(
        `[MSW] 스터디 ${studyId}의 멤버 ${memberId} 역할을 ${role}로 변경`
      );

      return new HttpResponse(null, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  // 스터디 멤버 삭제
  http.delete(
    "http://localhost:8080/studies/:studyId/management/members/:memberId",
    ({ params }) => {
      const { studyId, memberId } = params;

      console.log(`[MSW] 스터디 ${studyId}에서 멤버 ${memberId} 삭제`);

      return new HttpResponse(null, {
        status: 204,
      });
    }
  ),

  // 스터디 멤버 추가
  http.post(
    "http://localhost:8080/studies/:studyId/management/members",
    async ({ params, request }) => {
      const { studyId } = params;
      const requestData = await request.json();

      console.log(
        `[MSW] 스터디 ${studyId}에 멤버 추가: ${requestData.studentEmail}`
      );

      // 회원가입이 안 된 이메일인 경우 404 응답
      if (requestData.studentEmail === 'unregistered@example.com') {
        return new HttpResponse(null, {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // 새 멤버 ID는 현재 시간을 사용하여 임의로 생성
      const newMemberId = Date.now();

      // 생성된 리소스의 위치를 Location 헤더로 반환 (RESTful API 관행)
      return new HttpResponse(null, {
        status: 201,
        headers: {
          Location: `http://localhost:8080/studies/${studyId}/management/members/${newMemberId}`,
          "Content-Type": "application/json",
        },
      });
    }
  ),

  // 일정 목록 조회
  http.get("http://localhost:8080/studies/:studyId/schedules", ({ params }) => {
    const { studyId } = params;

    console.log(`[MSW] 스터디 ${studyId}의 일정 목록 조회`);

    // 더미 일정 데이터 반환
    return HttpResponse.json([
      {
        scheduleId: 1,
        round: 1,
        title: "첫 번째 모임",
        content:
          "첫 번째 모임 - 자기소개\n서로 인사하고 스터디 방향성에 대해 논의합니다.",
        date: "2024.03.15",
      },
      {
        scheduleId: 2,
        round: 2,
        title: "두 번째 모임",
        content:
          "두 번째 모임 - 주제 선정\n프로젝트 주제를 선정하고 역할을 분담합니다.",
        date: "2024.03.22",
      },
      {
        scheduleId: 3,
        round: 3,
        title: "세 번째 모임",
        content:
          "세 번째 모임 - 중간 발표\n지금까지의 진행 상황을 공유하고 피드백을 주고받습니다.",
        date: "2024.03.29",
      },
    ]);
  }),

  // 일정 상세 조회
  http.get(
    "http://localhost:8080/studies/:studyId/schedules/:scheduleId",
    ({ params }) => {
      const { studyId, scheduleId } = params;

      console.log(`[MSW] 스터디 ${studyId}의 일정 ${scheduleId} 상세 조회`);

      // 더미 일정 상세 데이터 반환
      return HttpResponse.json({
        scheduleId: parseInt(scheduleId),
        round: parseInt(scheduleId),
        title: `${scheduleId}번째 모임`,
        content: `${scheduleId}번째 모임 상세 내용입니다. 이 모임에서는 스터디 진행 상황을 점검하고 다음 단계를 계획합니다.`,
        date: "2024.04.05",
      });
    }
  ),

  // 일정 추가
  http.post(
    "http://localhost:8080/studies/:studyId/schedules/add",
    async ({ params, request }) => {
      const { studyId } = params;
      const scheduleData = await request.json();

      console.log(`[MSW] 스터디 ${studyId}에 일정 추가:`, scheduleData);

      // 새 일정 ID는 현재 시간을 사용하여 임의로 생성
      const newScheduleId = Date.now();

      // 생성된 리소스의 위치를 Location 헤더로 반환
      return new HttpResponse(null, {
        status: 201,
        headers: {
          Location: `http://localhost:8080/studies/${studyId}/schedules/${newScheduleId}`,
          "Content-Type": "application/json",
        },
      });
    }
  ),

  // 일정 수정
  http.put(
    "http://localhost:8080/studies/:studyId/schedules/:scheduleId",
    async ({ params, request }) => {
      const { studyId, scheduleId } = params;
      const scheduleData = await request.json();

      console.log(
        `[MSW] 스터디 ${studyId}의 일정 ${scheduleId} 수정:`,
        scheduleData
      );

      // 수정 성공 응답
      return new HttpResponse(null, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  // 일정 삭제
  http.delete(
    "http://localhost:8080/studies/:studyId/schedules/:scheduleId",
    ({ params }) => {
      const { studyId, scheduleId } = params;

      console.log(`[MSW] 스터디 ${studyId}의 일정 ${scheduleId} 삭제`);

      // 삭제 성공 응답
      return new HttpResponse(null, {
        status: 204,
      });
    }
  ),
];
