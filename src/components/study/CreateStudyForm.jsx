import { useState } from "react";
import { studyService, tokenUtils } from "../../services/api";
import { validateToken } from "../../utils/authUtils";
import ImageUploader from "./ImageUploader";
import Button from "../common/Button";
import { FaSearchPlus } from "react-icons/fa";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    padding: "0 2rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem",
    fontSize: "24px",
    fontWeight: "bold",
  },
  searchIcon: {
    marginRight: "8px",
    fontSize: "24px",
  },
  formSection: {
    marginBottom: "2rem",
  },
  formGroup: {
    width: "100%",
    marginBottom: "1.5rem",
  },
  requiredField: {
    color: "#FF0000",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "16px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    fontSize: "14px",
  },
  shortTextarea: {
    width: "100%",
    height: "80px",
    padding: "12px",
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    resize: "none",
    fontSize: "14px",
  },
  pointSectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  pointGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1rem",
  },
  pointRow: {
    display: "flex",
    alignItems: "center",
  },
  pointLabel: {
    width: "80px",
    fontSize: "14px",
    color: "#000000",
  },
  pointInputContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    overflow: "hidden",
  },
  pointInput: {
    width: "100%",
    padding: "12px",
    border: "none",
    fontSize: "14px",
  },
  pointInputHint: {
    color: "#999",
    fontSize: "14px",
    marginLeft: "8px",
  },
  pointSuffix: {
    padding: "0 12px",
    backgroundColor: "#F5F5F5",
    color: "#666666",
    fontSize: "14px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "2rem",
  },
  button: {
    padding: "10px 24px",
    backgroundColor: "#FF0000",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    cursor: "not-allowed",
  },
  errorMessage: {
    padding: "12px",
    backgroundColor: "#FFEBEE",
    color: "#D32F2F",
    borderRadius: "4px",
    marginBottom: "1rem",
    fontSize: "14px",
  },
};

function CreateStudyForm({ onSuccess, onError, onNavigate }) {
  const [studyName, setStudyName] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 포인트 설정 상태 추가
  const [presentPoint, setPresentPoint] = useState(100);
  const [latePoint, setLatePoint] = useState(50);
  const [absentPoint, setAbsentPoint] = useState(0);

  // 이미지 업로드 핸들러
  const handleImageChange = (newImage, newPreviewUrl) => {
    try {
      console.log("[CreateStudyForm] 이미지 변경:", {
        imageExists: !!newImage,
        previewUrlExists: !!newPreviewUrl,
        imageType: newImage ? newImage.type : "none",
      });

      // 이미지 크기 제한 및 압축
      if (newImage && newPreviewUrl) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          // 더 작은 크기로 제한 (300x200)
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          // 이미지 크기 조정
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          // 배경을 흰색으로 설정 (투명 배경 제거)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // 항상 JPEG 형식으로 변환하고 품질을 30%로 낮춤
          const compressedImageUrl = canvas.toDataURL("image/jpeg", 0.3);
          console.log("[CreateStudyForm] 이미지 압축 완료:", {
            originalSize: newPreviewUrl.length,
            compressedSize: compressedImageUrl.length,
            compressionRatio:
              (
                (compressedImageUrl.length / newPreviewUrl.length) *
                100
              ).toFixed(2) + "%",
          });

          setImage(newImage);
          setPreviewUrl(compressedImageUrl);
        };
        img.src = newPreviewUrl;
      } else {
        setImage(newImage);
        setPreviewUrl(newPreviewUrl);
      }
    } catch (error) {
      console.error("[CreateStudyForm] 이미지 처리 오류:", error);
      setError("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    try {
      console.log("[CreateStudyForm] 이미지 제거");
      setImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("[CreateStudyForm] 이미지 제거 오류:", error);
      // 오류가 발생해도 이미지를 제거하려고 시도
      setImage(null);
      setPreviewUrl(null);
    }
  };

  // 포인트 입력 처리 함수
  const handlePointChange = (setter) => (e) => {
    const value = e.target.value;

    // 빈 값인 경우 0으로 설정
    if (value === "") {
      setter(0);
      return;
    }

    // 숫자 검증 (양수, 음수, 0 허용)
    if (!/^-?\d+$/.test(value)) {
      return;
    }

    // 정수로 변환하여 설정
    const pointAmount = parseInt(value, 10);
    setter(pointAmount);
  };

  // 스터디 생성 핸들러
  const handleCreateStudy = async () => {
    console.log("[CreateStudyForm] 스터디 생성 시작");

    // 유효성 검사
    if (!studyName.trim()) {
      setError("스터디 이름을 입력해주세요.");
      if (onError) onError("스터디 이름을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setError("한 줄 소개를 입력해주세요.");
      if (onError) onError("한 줄 소개를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 토큰 유효성 검사
      const tokenValidation = validateToken();
      if (!tokenValidation.isValid) {
        throw new Error(
          tokenValidation.errorMessage ||
            "인증에 문제가 발생했습니다. 다시 로그인해주세요."
        );
      }

      // 파일 이름 추출 (이미지가 있는 경우)
      let fileName = null;
      if (image) {
        const fileExtension = image.name.split(".").pop();
        fileName = `study_${Date.now()}.${fileExtension}`;
      }

      // API 요청 데이터 준비
      const studyData = {
        studyName: studyName,
        studyContent: content,
        presentPoint: presentPoint,
        latePoint: latePoint,
        absentPoint: absentPoint,
        fileName: fileName,
      };

      console.log("[CreateStudyForm] 스터디 생성 요청 데이터:", {
        ...studyData,
        hasImage: !!image,
        imageSize: image ? `${Math.round(image.size / 1024)}KB` : "없음",
      });

      // 스터디 생성 API 호출 (이미지 있거나 없거나 같은 함수 사용)
      const response = await studyService.createStudyWithImage(
        studyData,
        image
      );
      console.log("[CreateStudyForm] 스터디 생성 응답:", response);

      // 경고 메시지가 있는 경우 표시
      if (response.warning) {
        console.warn("[CreateStudyForm] 경고:", response.warning);
        // 사용자에게 경고 메시지 표시 (선택적)
      }

      // 성공 여부 확인 (studyId가 있는 경우)
      if (response && response.studyId) {
        console.log("[CreateStudyForm] 스터디 생성 성공:", response.studyId);

        // 프론트엔드 스터디 데이터 형식에 맞게 변환
        const formattedStudyData = {
          id: response.studyId,
          title: studyName,
          description: content,
          imageUrl: response.uploadUrl || "",
          currentMembers: 1,
          maxMembers: 10,
          status: "모집중",
        };

        console.log(
          "[CreateStudyForm] 페이지 이동 시 전달할 스터디 데이터:",
          formattedStudyData
        );

        // 성공 콜백 호출
        if (onSuccess) onSuccess(response);

        // 스터디 상세 페이지로 리다이렉트
        if (onNavigate) {
          onNavigate(`/studies/${response.studyId}`, {
            state: { studyData: formattedStudyData },
          });
        }

        return;
      }

      // 응답이 성공이 아닌 경우 처리
      if (response && response.success === false) {
        setError(response.message || "스터디 생성에 실패했습니다.");
        if (onError) onError(response.message || "스터디 생성에 실패했습니다.");

        // 재로그인이 필요한 경우
        if (response.requireRelogin) {
          console.log("[CreateStudyForm] 재로그인이 필요합니다.");
          setError(response.message + " (로그인 페이지로 이동해주세요)");
        }

        return;
      }
    } catch (error) {
      console.error("[CreateStudyForm] 스터디 생성 중 오류:", error);

      // 에러 유형에 따른 분기 처리
      if (error.type === "AUTH_ERROR") {
        const errorMessage = "인증에 실패했습니다. 다시 로그인해주세요.";
        setError(errorMessage);
        if (onError) onError(errorMessage);

        // 인증 오류 시 로그인 페이지로 리다이렉트 (5초 지연)
        setTimeout(() => {
          const loginUrl = `${window.location.protocol}//${window.location.host}/login`;
          window.location.href = loginUrl;
        }, 5000);
      } else if (error.type === "NETWORK_ERROR") {
        const errorMessage =
          "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.";
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } else {
        // 기타 오류
        const errorMessage =
          error.message || "스터디 생성 중 오류가 발생했습니다.";
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <span style={styles.searchIcon}>
          <FaSearchPlus />
        </span>
        스터디 생성
      </div>

      {/* 에러 메시지 표시 */}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* 스터디 이름 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <span style={styles.requiredField}>*</span>스터디 이름
        </label>
        <input
          type="text"
          placeholder="스터디 이름을 입력하세요."
          value={studyName}
          onChange={(e) => setStudyName(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* 한 줄 소개 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <span style={styles.requiredField}>*</span>한 줄 소개
        </label>
        <textarea
          placeholder="스터디를 한 줄로 소개해주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={styles.shortTextarea}
        />
      </div>

      {/* 이미지 업로드 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <span style={styles.requiredField}>*</span>이미지
        </label>
        <ImageUploader
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
          previewUrl={previewUrl}
        />
      </div>

      {/* 포인트 설정 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <span style={styles.requiredField}>*</span>포인트 설정
        </label>
        <div style={styles.pointGrid}>
          {/* 출석 포인트 */}
          <div style={styles.pointRow}>
            <div style={styles.pointLabel}>출석</div>
            <div style={styles.pointInputContainer}>
              <input
                type="text"
                value={presentPoint}
                onChange={handlePointChange(setPresentPoint)}
                style={styles.pointInput}
              />
              <div style={styles.pointSuffix}>점</div>
            </div>
            <div style={styles.pointInputHint}>예) 100pt</div>
          </div>

          {/* 지각 포인트 */}
          <div style={styles.pointRow}>
            <div style={styles.pointLabel}>지각</div>
            <div style={styles.pointInputContainer}>
              <input
                type="text"
                value={latePoint}
                onChange={handlePointChange(setLatePoint)}
                style={styles.pointInput}
              />
              <div style={styles.pointSuffix}>점</div>
            </div>
            <div style={styles.pointInputHint}>예) 50pt</div>
          </div>

          {/* 결석 포인트 */}
          <div style={styles.pointRow}>
            <div style={styles.pointLabel}>결석</div>
            <div style={styles.pointInputContainer}>
              <input
                type="text"
                value={absentPoint}
                onChange={handlePointChange(setAbsentPoint)}
                style={styles.pointInput}
              />
              <div style={styles.pointSuffix}>점</div>
            </div>
            <div style={styles.pointInputHint}>예) 0pt</div>
          </div>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div style={styles.buttonContainer}>
        <Button
          variant="complete"
          onClick={handleCreateStudy}
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {}),
          }}
        >
          {isSubmitting ? "처리 중..." : "완료"}
        </Button>
      </div>
    </div>
  );
}

export default CreateStudyForm;
