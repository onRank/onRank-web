import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { FaUserPen } from "react-icons/fa6";
import MyPageCard from "../../components/user/MyPageCard";
import { mypageService } from "../../services/mypage";
import Button from "../../components/common/Button";

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
  mainContent: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: 200,
    position: "relative",
  },
  subContent: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-start",
    minHeight: 200,
    position: "relative",
  },
  profileWrapper: {
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 320,
  },
  profileInfo: {
    textAlign: "center",
    marginBottom: 12,
    display: "contents",
  },
  profileName: {
    fontWeight: 600,
    fontSize: 18,
    marginBottom: 4,
  },
  profileId: {
    color: "#888",
    fontSize: 15,
    marginBottom: 4,
  },
  profileSchool: {
    color: "#888",
    fontSize: 15,
    marginBottom: 4,
  },
  profileSchoolId: {
    color: "#888",
    fontSize: 15,
    marginBottom: 4,
  },
  editButton: {
    marginTop: 10,
    border: "1.5px solid #222",
    borderRadius: 8,
    padding: "4px 16px",
    background: "#fff",
    fontWeight: 500,
    cursor: "pointer",
  },
  subContentTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    margin: 10,
    width: "100%",
  },
  subContentText: {
    fontWeight: 700,
    fontSize: 24,
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
  },
};

function MyPage() {
  const navigate = useNavigate();
  const { user, refreshUserInfo, isDetailedUserInfo } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myPageData, setMyPageData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        const response = await mypageService.getMyPage();
        setMyPageData(response);
      } catch (error) {
        setError("마이페이지 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyPage();
  }, []);

  useEffect(() => {
    const loadUserDetails = async () => {
      if (isDetailedUserInfo) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await refreshUserInfo();
      } catch (error) {
        setError("사용자 정보를 불러오는데 실패했습니다.");
        if (error.response?.status === 401) {
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserDetails();
  }, [refreshUserInfo, isDetailedUserInfo, navigate]);

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";

    // 숫자만 추출
    const cleaned = phoneNumber.replace(/\D/g, "");

    // 길이에 따라 형식 적용
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }

    return phoneNumber;
  };

  // const handleEditButtonClick = async () => {
  //   const response = await mypageService.editMypage(myPageData.studentId);
  //   if (response.status === 200) {
  //       setIsEdit(true);
  //   }
  // };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!myPageData)
    return <ErrorMessage message="마이페이지 정보를 불러올 수 없습니다." />;

  // 진행중인 스터디만, studyId 오름차순 정렬
  const studyList = (myPageData.studyList || [])
    .filter((study) => study.studyStatus === "PROGRESS")
    .sort((a, b) => a.studyId - b.studyId);

  return (
    <div style={styles.wrapper}>
      {/* <Header /> */}
      <div style={styles.container}>
        {/* 상단 중앙 타이틀 */}
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
          <span style={styles.titleText}>마이페이지</span>
        </div>
        {/* 메인 컨텐츠 */}
        <div style={styles.mainContent}>
          {/* 가운데 프로필 */}
          <div style={styles.profileWrapper}>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>{myPageData.studentName}</div>
              <div style={styles.profileId}>
                {formatPhoneNumber(myPageData.studentPhoneNumber)}
                <br />
                {myPageData.studentEmail}
              </div>
              <div style={styles.profileSchool}>{myPageData.studentSchool}</div>
              <div style={styles.profileSchoolId}>
                {myPageData.studentDepartment}
              </div>
              <Button
                variant="edit"
                label="수정하기"
                // onClick={handleEditButtonClick}
                style={{ width: 75, fontSize: 12 }}
              />
            </div>
          </div>
        </div>
        {/* 하단 컨텐츠 */}
        <div style={styles.subContentTitle}>
          <div style={styles.subContentText}>스터디</div>
        </div>
        <div style={styles.subContent}>
          <div style={styles.cardList}>
            {studyList.map((study, idx) => (
              <MyPageCard
                key={idx}
                icon={
                  study.file?.fileName === null ? null : study.file?.fileUrl
                }
                name={study.studyName}
                studyStatus={study.studyStatus}
                onClick={() => navigate(`/studies/${study.studyId}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
