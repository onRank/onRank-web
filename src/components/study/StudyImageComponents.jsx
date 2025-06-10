import React, { useState, useEffect } from 'react';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

/**
 * 이미지 로딩 관리 훅 - 이미지 로딩 상태를 관리합니다.
 * 
 * @param {string} imageUrl - 이미지 URL
 * @returns {Object} - 이미지 로딩 상태 및 이벤트 핸들러
 */
export const useImageLoading = (imageUrl) => {
  const [loading, setLoading] = useState(false);
  
  // 이미지 로드 완료 핸들러
  const handleLoad = () => {
    console.log("이미지 로드 완료");
    setLoading(false);
  };
  
  // 이미지 로드 오류 핸들러
  const handleError = () => {
    console.error("이미지 로드 실패");
    setLoading(false);
  };
  
  // 이미지 URL이 변경될 때 로딩 상태 설정
  useEffect(() => {
    if (imageUrl && !imageUrl.startsWith('blob:')) {
      setLoading(true);
      
      // 이미지 프리로드
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = imageUrl;
    }
  }, [imageUrl]);
  
  return {
    loading,
    setLoading,
    handleLoad,
    handleError
  };
};

/**
 * 스터디 이미지 컴포넌트 - 로딩 상태에 따라 다른 UI를 표시합니다.
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.imageUrl - 이미지 URL
 * @param {boolean} props.loading - 로딩 상태
 * @param {Function} props.onLoad - 이미지 로드 완료 핸들러
 * @param {Function} props.onError - 이미지 로드 오류 핸들러
 * @returns {React.ReactElement} - 이미지 컴포넌트
 */
export const StudyImage = ({ imageUrl, loading, onLoad, onError }) => {
  const LoadingIcon = AiOutlineLoading3Quarters;
  
  if (!imageUrl) {
    return (
      <div style={{ 
        border: '1px dashed #ccc', 
        borderRadius: '8px', 
        padding: '50px', 
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        color: '#999',
        width: '400px',
        margin: '0 auto 20px auto'
      }}>
        등록된 이미지가 없습니다
      </div>
    );
  }
  
  // 이미지 로딩 중일 때 로딩 인디케이터 표시
  if (loading) {
    return (
      <div style={{ 
        border: '3px solid #0066ff', 
        borderRadius: '8px', 
        padding: '15px', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        margin: '0 auto 20px auto',
        maxWidth: '600px',
        minHeight: '300px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingIcon style={{ 
            fontSize: '40px', 
            color: '#0066ff',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '10px', color: '#666' }}>이미지 로딩 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      border: '3px solid #FF0000', 
      borderRadius: '8px', 
      padding: '15px', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      margin: '0 auto 20px auto',
      maxWidth: '600px',
      minHeight: '200px'
    }}>
      <img 
        src={imageUrl} 
        alt="스터디 이미지" 
        style={{ 
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '400px',
          borderRadius: '4px', 
          border: '1px solid #000',
          backgroundColor: '#FFF',
          display: 'block',
          objectFit: 'contain'
        }} 
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}; 