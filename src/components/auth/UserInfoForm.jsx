import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService, tokenUtils } from "../../services/api";

function UserInfoForm() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    studentName: "",
    studentSchool: "",
    studentDepartment: "",
    studentPhoneNumber: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  useEffect(() => {
    // 페이지 새로고침이나 창 닫기 시 토큰 제거 (단, 제출 중이거나 등록 완료가 아닐 때만)
    const handleBeforeUnload = (e) => {
      if (!isSubmitting && !isRegistrationComplete) {
        tokenUtils.removeToken();
      }
    };

    // 페이지 이동 시 토큰 제거 (단, 제출 중이거나 등록 완료가 아닐 때만)
    const handleNavigate = () => {
      if (!isSubmitting && !isRegistrationComplete) {
        tokenUtils.removeToken();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigate);

    // cleanup 함수
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigate);

      // 토큰 제거 로직 삭제 - 이 부분이 문제를 일으킴
      // studies로 이동할 때는 토큰을 유지해야 함
    };
  }, [isSubmitting, isRegistrationComplete]);

  useEffect(() => {
    // 토큰에서 사용자 정보 추출
    const token = tokenUtils.getToken();
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      setFormData((prev) => ({
        ...prev,
        email: tokenPayload.email || "",
      }));
    } catch (error) {
      console.error("토큰 파싱 실패:", error);
      tokenUtils.removeToken();
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // 입력값 검증
    const trimmedName = formData.studentName.trim();
    const trimmedPhone = formData.studentPhoneNumber.trim();

    if (!trimmedName) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!trimmedPhone) {
      setError("전화번호를 입력해주세요.");
      return;
    }
    if (!/^[0-9]{11}$/.test(trimmedPhone)) {
      setError("전화번호는 11자리 숫자여야 합니다.");
      return;
    }

    try {
      const token = tokenUtils.getToken();
      if (!token) {
        setError("인증 토큰이 없습니다. 다시 로그인해주세요.");
        navigate("/");
        return;
      }

      const submitData = {
        ...formData,
        studentName: trimmedName,
        studentPhoneNumber: trimmedPhone,
        studentSchool: formData.studentSchool.trim(),
        studentDepartment: formData.studentDepartment.trim(),
      };

      console.log("회원정보 등록 시도:", submitData);
      const response = await authService.addUserInfo(submitData);

      // 디버그 로그 추가
      console.log("서버 응답 구조:", {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        hasHeaders: !!response.headers,
        headers: response.headers ? Object.keys(response.headers) : null,
        location: response.headers?.location,
      });

      // 201 상태코드면 성공으로 처리
      if (response.status === 201) {
        console.log("회원정보 등록 성공");

        // Location 헤더가 있으면 로그
        const resourceUrl = response.headers?.location;
        if (resourceUrl) {
          console.log("생성된 리소스 URL:", resourceUrl);
        }

        // 등록 완료 상태 설정
        setIsRegistrationComplete(true);

        // 새 토큰이 있으면 저장
        const newToken =
          response.headers["authorization"] ||
          response.headers["Authorization"];
        if (newToken) {
          console.log("등록 응답에서 새 토큰 발견, 저장 중...");

          // 토큰 저장
          tokenUtils.setToken(newToken);

          // 이동 플래그를 sessionStorage에 저장 (중요!)
          sessionStorage.setItem("registrationComplete", "true");

          // 토큰이 localStorage에 완전히 저장되도록 지연
          console.log("토큰 저장 확인 및 페이지 이동 준비 중...");

          // 토큰이 실제로 저장되었는지 확인하는 함수
          const checkTokenSaved = async () => {
            // 최대 10번까지 100ms 간격으로 확인 (총 1초)
            for (let i = 0; i < 10; i++) {
              const savedToken = localStorage.getItem("accessToken");
              if (savedToken) {
                console.log(
                  "토큰이 성공적으로 저장됨:",
                  savedToken.substring(0, 15) + "..."
                );
                return true;
              }
              console.log(`토큰 저장 확인 중... (시도 ${i + 1}/10)`);
              await new Promise((resolve) => setTimeout(resolve, 100));
            }

            console.warn("토큰 저장 확인 실패, 직접 저장 시도");
            // 직접 저장 시도
            try {
              tokenUtils.setToken(newToken);
              console.log("토큰 직접 저장 시도 완료");
              return !!localStorage.getItem("accessToken");
            } catch (e) {
              console.error("토큰 직접 저장 실패:", e);
              return false;
            }
          };

          const tokenSaved = await checkTokenSaved();

          // 토큰 저장 성공 여부에 따라 다른 방식으로 처리
          if (tokenSaved) {
            console.log("토큰 저장 확인됨, 정상적인 페이지 이동 준비");
          } else {
            console.warn("토큰 저장 실패, 대체 방법으로 진행");
          }
        }

        // sessionStorage에도 토큰을 임시 저장 (페이지 이동 간 보존)
        const finalToken = localStorage.getItem("accessToken");
        if (finalToken) {
          // 이미 tokenUtils.setToken에서 백업 저장을 했으므로 추가 저장은 필요 없음
          console.log("토큰 확인됨, 스터디 페이지로 이동");

          // URL 쿼리 파라미터로도 토큰 전달 (극단적인 대비책)
          const tokenParam = encodeURIComponent(finalToken);
          console.log("회원가입 완료, 토큰과 함께 /studies로 이동");
          setIsSubmitting(false); // 이동 전에 상태 업데이트
          navigate(`/studies?token=${tokenParam}`);
        } else {
          // 토큰이 없는 경우 그냥 이동
          console.log("토큰 없이 /studies로 이동");
          setIsSubmitting(false);
          navigate("/studies");
        }
        return;
      }

      if (!response.data) {
        throw new Error("서버 응답이 올바르지 않습니다");
      }

      console.log("회원정보 등록 성공:", response);
      setUser(response.data);
      navigate("/studies");
    } catch (error) {
      console.error("회원정보 등록 실패:", error);
      setIsSubmitting(false);

      if (
        error.message === "서버와 통신할 수 없습니다" ||
        error.message === "Network Error"
      ) {
        setError("서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (error.message === "인증이 만료되었습니다") {
        setError(error.message);
        navigate("/");
        return;
      }

      setError(
        error.message || "회원정보 등록에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="oauth-add-container">
      <h2>회원정보 입력</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            이름 <span className="required">(필수)</span>
          </label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) =>
              setFormData({
                ...formData,
                studentName: e.target.value,
              })
            }
            placeholder="이름을 입력해주세요"
            required
          />
        </div>

        <div className="form-group">
          <label>
            전화번호 <span className="required">(필수)</span>
          </label>
          <input
            type="tel"
            value={formData.studentPhoneNumber}
            onChange={(e) => {
              // 숫자만 입력 가능하도록
              const value = e.target.value.replace(/[^0-9]/g, "");
              setFormData({
                ...formData,
                studentPhoneNumber: value,
              });
            }}
            placeholder="01012345678 형식으로 입력해주세요"
            required
            pattern="[0-9]{11}"
            maxLength={11}
          />
        </div>

        <div className="form-section">
          <h3>소속(선택)</h3>

          <div className="form-group">
            <label>학교</label>
            <input
              type="text"
              value={formData.studentSchool}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  studentSchool: e.target.value,
                })
              }
              placeholder="학교를 입력해주세요"
            />
          </div>

          <div className="form-group">
            <label>학과</label>
            <input
              type="text"
              value={formData.studentDepartment}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  studentDepartment: e.target.value,
                })
              }
              placeholder="학과를 입력해주세요"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={
            !formData.studentName.trim() ||
            !/^[0-9]{11}$/.test(formData.studentPhoneNumber)
          }>
          완료
        </button>
      </form>
    </div>
  );
}

export default UserInfoForm;
