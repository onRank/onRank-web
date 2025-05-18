import { useState, useEffect } from "react";
import { FaUserPen } from "react-icons/fa6";
import { mypageService } from "../../services/mypage";
import Button from "../common/Button";

function MyPageEditForm({ myPageData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    studentName: "",
    studentPhoneNumber: "",
    studentSchool: "",
    studentDepartment: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // myPageData로 초기화
  useEffect(() => {
    if (myPageData) {
      setFormData({
        studentName: myPageData.studentName || "",
        studentPhoneNumber: myPageData.studentPhoneNumber || "",
        studentSchool: myPageData.studentSchool || "",
        studentDepartment: myPageData.studentDepartment || "",
      });
    }
  }, [myPageData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await mypageService.editMyPage({
        ...myPageData,
        ...formData,
      });
      if (response.status === 200) {
        if (onSuccess) onSuccess();
      } else {
        setError("수정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      setError("수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      background: "none",
    },
    container: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "30px 170px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
    },
    titleRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 10,
      margin: 20,
      width: "100%",
    },
    titleIcon: {
      fontSize: 32,
    },
    titleText: {
      fontWeight: 700,
      fontSize: 28,
    },
    buttonRow: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.titleRow}>
          <span style={styles.titleIcon}>
            <FaUserPen
              style={{
                width: 41,
                height: 33,
                display: "block",
                alignContent: "center",
              }}
            />
          </span>
          <span style={styles.titleText}>마이페이지 수정</span>
        </div>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontWeight: 500 }}>이름</label>
            <input
              type="text"
              style={{ width: "40%" }}
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
            <label style={{ fontWeight: 500 }}>전화번호</label>
            <input
              type="tel"
              style={{ width: "40%" }}
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
            <h3 style={{ fontSize: 18 }}>소속(선택)</h3>

            <div className="form-group">
              <label>학교</label>
              <input
                type="text"
                style={{ width: "40%" }}
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
                style={{ width: "40%" }}
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

          <div style={styles.buttonRow}>
            <Button
              type="button"
              variant="back"
              label="닫기"
              onClick={onCancel}
              disabled={loading}
            />
            <Button
              type="button"
              variant="complete"
              label="완료"
              onClick={handleSubmit}
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
export default MyPageEditForm;
