import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function DeviceInfoBar() {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // 모바일 환경에서만 표시
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsVisible(isMobile);

    // 기기 정보 수집
    if (isMobile) {
      const info = {
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
      };
      setDeviceInfo(info);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        backgroundColor: colors.secondaryBackground,
        color: colors.text,
        fontSize: "10px",
        padding: "4px 8px",
        textAlign: "center",
        overflowX: "auto",
        whiteSpace: "nowrap",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div>Screen: {deviceInfo.screen}</div>
      <div>Viewport: {deviceInfo.viewport}</div>
      <div>Pixel Ratio: {deviceInfo.devicePixelRatio}</div>
    </div>
  );
}

export default DeviceInfoBar; 