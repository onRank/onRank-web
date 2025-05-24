import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { FaUserPen } from "react-icons/fa6";
import MyPageCard from "../../components/user/MyPageCard";
import { mypageService } from "../../services/mypage";
import Button from "../../components/common/Button";
import MyPageEditForm from "../../components/user/MyPageEditForm";
import "./Mypage.css";

function MyPage() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myPageData, setMyPageData] = useState(null);
  const [isEditting, setIsEditting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        // 사용자 정보 강제 새로고침 (토큰 만료 및 재발급 포함)
        const userResult = await mypageService.refreshUserInfo();
        setUser(userResult.data);
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!myPageData)
    return <ErrorMessage message="마이페이지 정보를 불러올 수 없습니다." />;

  // studyId 오름차순 정렬
  const studyList = (myPageData.studyList || []).sort(
    (a, b) => a.studyId - b.studyId
  );

  // 수정하기 버튼 클릭 시
  const handleEditButtonClick = () => {
    setIsEditting(true);
  };

  if (isEditting) {
    return (
      <MyPageEditForm
        myPageData={myPageData}
        onCancel={() => setIsEditting(false)}
        onSuccess={() => {
          setIsEditting(false);
        }}
      />
    );
  }

  return (
    <div className="wrapper">
      <div className="container">
        {/* 상단 중앙 타이틀 */}
        <div className="titleRow">
          <span className="titleIcon">
            <FaUserPen
              style={{
                width: 41,
                height: 33,
                display: "block",
                alignContent: "center",
              }}
            />
          </span>
          <span className="titleText">마이페이지</span>
        </div>
        {/* 메인 컨텐츠 */}
        <div className="mainContent">
          {/* 가운데 프로필 */}
          <div className="profileWrapper">
            <div className="profileInfo">
              <div className="profileName">{myPageData.studentName}</div>
              <div className="profileId">
                {formatPhoneNumber(myPageData.studentPhoneNumber)}
                <br />
                {myPageData.studentEmail}
              </div>
              <div className="profileSchool">{myPageData.studentSchool}</div>
              <div className="profileSchoolId">
                {myPageData.studentDepartment}
              </div>
              <Button
                variant="edit"
                label="수정하기"
                onClick={handleEditButtonClick}
                style={{ width: 75, fontSize: 12 }}
              />
            </div>
          </div>
        </div>
        {/* 하단 컨텐츠 */}
        <div className="subContentTitle">
          <div className="subContentText">스터디</div>
        </div>
        <div className="subContent">
          <div className="cardList">
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
