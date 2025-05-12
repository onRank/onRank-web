import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import StudyCard from "./StudyCard";
import { useTheme } from "../../contexts/ThemeContext";

function StudyList({ studies }) {
  const { colors } = useTheme();
  const navigate = useNavigate();

  // 디버깅 정보 추가
  console.log("[StudyList] 받은 데이터 타입:", typeof studies);
  console.log("[StudyList] 배열 여부:", Array.isArray(studies));
  console.log("[StudyList] 데이터 길이:", studies?.length);
  console.log("[StudyList] 데이터 내용:", studies);

  // 첫 번째 스터디 객체의 구조 자세히 로깅
  if (studies && studies.length > 0) {
    console.log("[StudyList] 첫 번째 스터디 객체:", studies[0]);
    console.log("[StudyList] 첫 번째 스터디 필드들:", Object.keys(studies[0]));
    console.log("[StudyList] studyName 존재 여부:", "studyName" in studies[0]);
    console.log(
      "[StudyList] studyContent 존재 여부:",
      "studyContent" in studies[0]
    );
    console.log("[StudyList] file 존재 여부:", "file" in studies[0]);
    console.log("[StudyList] studyId 존재 여부:", "studyId" in studies[0]);

    // file 객체가 있는 경우 추가 로깅
    if (studies[0].file) {
      console.log("[StudyList] file 객체:", studies[0].file);
      console.log(
        "[StudyList] fileUrl 존재 여부:",
        "fileUrl" in studies[0].file
      );
    }
  }

  if (!studies || !studies.length) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: colors.secondaryBackground,
          borderRadius: "8px",
          margin: "1rem 0",
        }}>
        <h3 style={{ marginBottom: "1rem", color: colors.text }}>
          등록된 스터디가 없습니다
        </h3>
        <p style={{ color: colors.textSecondary, marginBottom: "1.5rem" }}>
          참여할 수 있는 스터디가 없거나 아직 스터디에 참여하지 않았습니다.
        </p>
        <button
          onClick={() => navigate("/studies/add")}
          style={{
            backgroundColor: colors.primary,
            color: colors.buttonText,
            border: "none",
            borderRadius: "4px",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background-color 0.2s",
            ":hover": {
              backgroundColor: colors.primaryHover,
            },
          }}>
          스터디 생성하기
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1rem",
      }}>
      {studies.map((study, index) => {
        // 백엔드 필드명을 프론트엔드 필드명으로 매핑
        // studyId가 0인 경우도 유효한 ID로 처리하도록 수정
        const hasValidStudyId =
          study.studyId !== undefined && study.studyId !== null;

        // file 객체에서 이미지 URL 추출
        const fileUrl =
          study.file && study.file.fileUrl ? study.file.fileUrl : "";

        // 필요한 정보만 매핑
        const mappedStudy = {
          id: hasValidStudyId ? study.studyId : index,
          title: study.studyName || "제목 없음",
          description: study.studyContent || "설명 없음",
          imageUrl: fileUrl || "", // file 객체의 fileUrl 사용
        };

        // 매핑된 스터디 객체 로깅
        console.log(`[StudyList] 스터디 ${index} 매핑 결과:`, mappedStudy);

        // 고유한 키 생성 (가능하면 studyId 사용, 없으면 인덱스 사용)
        const uniqueKey = hasValidStudyId
          ? `study-${study.studyId}`
          : `study-index-${index}`;

        return (
          <StudyCard
            key={uniqueKey}
            study={mappedStudy}
            onClick={() =>
              navigate(`/studies/${mappedStudy.id}`, {
                state: { studyData: mappedStudy },
              })
            }
          />
        );
      })}
    </div>
  );
}

StudyList.propTypes = {
  studies: PropTypes.array.isRequired,
};

export default StudyList;
