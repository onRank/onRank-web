import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { MdAttachMoney } from "react-icons/md";
import { BiMoney } from "react-icons/bi";
import { GrFormClose } from "react-icons/gr";
import { BsPatchCheckFill } from "react-icons/bs";
import { ImCheckboxUnchecked } from "react-icons/im";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { api, tokenUtils } from "../../../services/api";
import MemberManagement from '../../../components/study/management/MemberManagement';
import StudyManagement from '../../../components/study/management/StudyManagement';
import PointManagement from '../../../components/study/management/PointManagement';
import { 
  uploadImageToS3, 
  handleImageFileChange
} from '../../../utils/imageUtils';
import {
  useImageLoading,
  StudyImage
} from '../../../components/study/StudyImageComponents';

// 스타일 컴포넌트 정의
const EditPageContainer = styled.div`
  padding: 24px;
`;

const EditPageTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const StatusValue = styled.span`
  font-size: 16px;
  font-weight: 400;
`;

const PointContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PointItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PointLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PointValue = styled.span`
  font-size: 16px;
  font-weight: 400;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const SaveButton = styled(Button)`
  background-color: #0066ff;
  color: white;
  border: none;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
`;

const InputContainer = styled.div`
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0066ff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #0066ff;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingIcon = styled(AiOutlineLoading3Quarters)`
  font-size: 32px;
  color: #0066ff;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background-color: #ffdddd;
  color: #ff0000;
  border-radius: 4px;
  margin-bottom: 16px;
`;

function StudyEditPage() {
  // ... ManagementTab의 나머지 코드를 그대로 복사하되, 컴포넌트 이름만 StudyEditPage로 변경

  return (
    <EditPageContainer>
      {/* ... 기존 JSX 코드에서 스타일 컴포넌트 이름만 변경 ... */}
    </EditPageContainer>
  );
}

export default StudyEditPage; 