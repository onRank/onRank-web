import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { studyService } from "../../../services/api";
import { tokenUtils } from "../../../utils/tokenUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import TimeSelector from "../../../components/common/TimeSelector";
import Button from "../../../components/common/Button";
import PropTypes from "prop-types";
import "./ScheduleAddPage.css";

function ScheduleAddPage({ onCancel }) {
  const { studyId } = useParams();
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("00:00");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 일정 목록을 가져와서 회차 번호 계산
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const schedules = await studyService.getSchedules(studyId);
        // 새 일정 회차는 현재 일정 갯수 + 1
        if (schedules && schedules.length > 0) {
          setDate(schedules[schedules.length - 1].date);
        }
      } catch (error) {
        console.error("[ScheduleAddPage] 일정 목록 조회 실패:", error);
      }
    };

    fetchSchedules();
  }, [studyId]);

  // 새로고침 감지 및 리다이렉트 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = tokenUtils.getToken();
      if (!token) {
        window.location.href = `${
          import.meta.env.VITE_CLOUDFRONT_URL
        }/studies/${studyId}/schedules`;
        return null;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 컴포넌트 마운트 시에도 토큰 체크
    const token = tokenUtils.getToken();
    if (!token) {
      window.location.href = `${
        import.meta.env.VITE_CLOUDFRONT_URL
      }/studies/${studyId}/schedules`;
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [studyId]);

  // 폼 유효성 검증 - 제목, 날짜, 시간, 내용 모두 필수
  const isFormValid =
    title.trim() !== "" && date !== "" && time !== "" && content.trim() !== "";

  // 일정 추가 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("제목, 날짜, 시간, 내용은 필수입니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // API 요청 데이터 형식으로 변환
      const scheduleData = {
        title: title.trim(),
        content: content.trim(),
        date: date,
        time: time,
      };

      // API 호출
      const result = await studyService.addSchedule(studyId, scheduleData);
      console.log("[ScheduleAddPage] 일정 추가 성공:", result);

      // 성공 시 일정 목록 페이지로 이동
      if (onCancel) onCancel();
    } catch (error) {
      console.error("[ScheduleAddPage] 일정 추가 실패:", error);
      setError(`일정 추가에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10000) {
      setContent(value);
    }
  };

  return (
    <div className="schedule-add-container">
      <div className="schedule-add-form">
        {error && (
          <div
            className="schedule-error"
            style={{
              backgroundColor: `${colors.error}20`,
              color: colors.error,
            }}>
            {error}
          </div>
        )}

        <div className="field-container">
          <h3 className="field-title" style={{ color: colors.textPrimary }}>
            <span className="required-mark">*</span>
            제목
          </h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목을 입력하세요."
            className="form-input"
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.inputBackground,
              color: colors.textPrimary,
            }}
            required
          />
        </div>

        <div className="field-container">
          <h3 className="field-title" style={{ color: colors.textPrimary }}>
            <span className="required-mark">*</span>
            날짜
          </h3>
          <div
            className="date-picker-container"
            onClick={() => document.getElementById("date-input").showPicker()}>
            <input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              style={{
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.inputBackground,
                color: colors.textPrimary,
                cursor: "pointer",
              }}
              required
            />
          </div>
        </div>

        <div className="field-container">
          <h3 className="field-title" style={{ color: colors.textPrimary }}>
            <span className="required-mark">*</span>
            시간
          </h3>
          <TimeSelector
            value={time}
            onChange={setTime}
            disabled={isSubmitting}
            style={{ width: "45%" }}
          />
        </div>

        <div className="field-container">
          <h3 className="field-title" style={{ color: colors.textPrimary }}>
            <span className="required-mark">*</span>
            내용
          </h3>
          <div className="textarea-container" style={{ position: "relative" }}>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="일정에 대한 설명을 입력하세요."
              className="form-input-content"
              style={{
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.inputBackground,
                color: colors.textPrimary,
                minHeight: "200px",
                resize: "vertical",
                paddingBottom: "32px",
              }}
              maxLength={10000}
              required
            />
            <div
              className="char-counter"
              style={{
                position: "absolute",
                right: "16px",
                bottom: "10px",
                color: colors.textSecondary,
                fontSize: "13px",
                background: "#fff",
                padding: "0 4px",
                pointerEvents: "none",
              }}>
              {content.length}/10000
            </div>
          </div>
        </div>

        <div className="button-container">
          <Button
            variant="upload"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          />
          <Button variant="back" onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
}

ScheduleAddPage.propTypes = {
  onCancel: PropTypes.func,
};

export default ScheduleAddPage;
