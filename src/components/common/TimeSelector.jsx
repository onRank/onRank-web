import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function TimeSelector({ value, onChange, disabled = false }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHours, selectedMinutes] = value
    ? value.split(":").map(Number)
    : [0, 0];
  const dropdownRef = useRef(null);

  // AM/PM 선택
  const isPM = selectedHours >= 12;

  // 12시간제로 표시할 시간
  const displayHours =
    selectedHours > 12
      ? selectedHours - 12
      : selectedHours === 0
      ? 12
      : selectedHours;

  // 12시간제 시간 배열 생성 (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // 0-55 분 배열 생성 (5분 단위)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // 시간 선택 핸들러
  const handleHourSelect = (hour) => {
    // 12시를 0시로 변환
    let newHour = hour === 12 ? 0 : hour;
    // PM인 경우 12시간 추가
    if (isPM) newHour += 12;
    const newValue = `${String(newHour).padStart(2, "0")}:${String(
      selectedMinutes
    ).padStart(2, "0")}`;
    onChange(newValue);
  };

  // 분 선택 핸들러
  const handleMinuteSelect = (minute) => {
    const newValue = `${String(selectedHours).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;
    onChange(newValue);
  };

  // AM/PM 토글
  const handleAmPmToggle = (newIsPM) => {
    let newHour;
    if (newIsPM) {
      // AM → PM
      newHour = selectedHours + 12;
    } else {
      // PM → AM
      newHour = selectedHours - 12;
    }
    // 예외 처리 (12시간제 변환)
    if (newHour === 24) newHour = 12;
    if (newHour === -12) newHour = 0;

    const newValue = `${String(newHour).padStart(2, "0")}:${String(
      selectedMinutes
    ).padStart(2, "0")}`;
    onChange(newValue);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }} ref={dropdownRef}>
      {/* 시간 표시 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: "45%",
          padding: "0.75rem",
          border: `1px solid ${colors.border}`,
          borderRadius: "4px",
          fontSize: "16px",
          backgroundColor: disabled
            ? colors.hoverBackground
            : colors.inputBackground,
          color: colors.textPrimary,
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        disabled={disabled}>
        <span>
          {String(displayHours).padStart(2, "0")}:
          {String(selectedMinutes).padStart(2, "0")} {isPM ? "PM" : "AM"}
        </span>
        <span>▼</span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            border: `1px solid ${colors.border}`,
            borderRadius: "4px",
            backgroundColor: colors.cardBackground,
            boxShadow: `0 2px 8px ${colors.shadowColor}`,
            zIndex: 1000,
            display: "flex",
            marginTop: "4px",
          }}>
          {/* 시간 선택 */}
          <div
            style={{
              flex: 1,
              maxHeight: "200px",
              overflowY: "auto",
              borderRight: `1px solid ${colors.border}`,
            }}>
            {hours.map((hour) => (
              <div
                key={hour}
                onClick={() => handleHourSelect(hour)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor:
                    hour === displayHours
                      ? colors.hoverBackground
                      : "transparent",
                  textAlign: "center",
                }}>
                {String(hour).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* 분 선택 */}
          <div
            style={{
              flex: 1,
              maxHeight: "200px",
              overflowY: "auto",
              borderRight: `1px solid ${colors.border}`,
            }}>
            {minutes.map((minute) => (
              <div
                key={minute}
                onClick={() => handleMinuteSelect(minute)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor:
                    minute === selectedMinutes
                      ? colors.hoverBackground
                      : "transparent",
                  textAlign: "center",
                }}>
                {String(minute).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* AM/PM 선택 */}
          <div style={{ flex: 1 }}>
            <div
              onClick={() => handleAmPmToggle(false)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: !isPM ? colors.hoverBackground : "transparent",
                textAlign: "center",
              }}>
              AM
            </div>
            <div
              onClick={() => handleAmPmToggle(true)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: isPM ? colors.hoverBackground : "transparent",
                textAlign: "center",
              }}>
              PM
            </div>
          </div>
        </div>
      )}

      {/* 숨겨진 입력 필드 (폼 제출용) */}
      <input type="hidden" name="time" value={value} />
    </div>
  );
}

export default TimeSelector;
