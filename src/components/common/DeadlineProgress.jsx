import React from 'react';
import './DeadlineProgress.css';

const DeadlineProgress = ({ dueDate }) => {
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!dueDate) return 0; // If no due date, return 0 (no progress)
    
    const now = new Date();
    const deadlineDate = new Date(dueDate);
    
    // If deadline has passed
    if (now > deadlineDate) return 0;
    
    // Calculate days between creation and deadline (assume assignment created 7 days before deadline)
    const totalTimespan = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const timeLeft = deadlineDate - now;
    
    // Calculate percentage of time left
    let percentage = Math.floor((timeLeft / totalTimespan) * 100);
    
    // Ensure percentage is between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    
    return percentage;
  };

  const progressPercentage = calculateProgress();
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "날짜 형식 오류";
      }
      
      return `${date.getFullYear()}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("날짜 변환 오류:", error);
      return "날짜 변환 오류";
    }
  };

  // Calculate D-day 
  const calculateDDay = () => {
    if (!dueDate) return "D-?";
    
    const now = new Date();
    const deadlineDate = new Date(dueDate);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    return diffDays < 0 ? "마감됨" : `D-${diffDays}`;
  };

  return (
    <div className="deadline-progress-container">
      <div className="deadline-info">
        <span>마감: {formatDate(dueDate)}</span>
        <span className="deadline-days">{calculateDDay()}</span>
      </div>
      <div className="deadline-progress-bar">
        <div 
          className="deadline-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DeadlineProgress; 