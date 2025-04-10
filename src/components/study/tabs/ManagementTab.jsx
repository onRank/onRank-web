import React, { useState, useEffect } from "react";
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
import MemberManagement from './management/MemberManagement';
import StudyManagement from './management/StudyManagement';
import PointManagement from './management/PointManagement';

// 스타일 컴포넌트 정의
const ManagementTabContainer = styled.div`
  padding: 24px;
`;

const TabTitle = styled.h2`
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
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
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

function ManagementTab() {
  const { studyId } = useParams();
  const [managementTab, setManagementTab] = useState('스터디'); // 관리 탭 내부 탭 (회원, 스터디, 포인트)
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(''); // 현재 사용자 역할 저장
  const [isEditing, setIsEditing] = useState(false);
  const [studyName, setStudyName] = useState("");
  const [studyContent, setStudyContent] = useState("");
  const [studyImageUrl, setStudyImageUrl] = useState("");
  const [studyImageFile, setStudyImageFile] = useState(null);
  const [studyGoogleFormUrl, setStudyGoogleFormUrl] = useState("");
  const [presentPoint, setPresentPoint] = useState(0);
  const [absentPoint, setAbsentPoint] = useState(0);
  const [latePoint, setLatePoint] = useState(0);
  const [studyStatus, setStudyStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 관리 탭 데이터 가져오기
  useEffect(() => {
    const fetchManagementData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/studies/${studyId}/management`, {
          withCredentials: true
        });
        const { data } = response.data;
        
        setStudyName(data.studyName);
        setStudyContent(data.studyContent);
        setStudyImageUrl(data.studyImageUrl || "");
        setStudyGoogleFormUrl(data.studyGoogleFormUrl || "");
        setPresentPoint(data.presentPoint);
        setAbsentPoint(data.absentPoint);
        setLatePoint(data.latePoint);
        setStudyStatus(data.studyStatus);
        
        // 회원 정보 설정 (memberContext가 있는 경우)
        if (data && data.memberContext) {
          setCurrentUserRole(data.memberContext.role);
        }
      } catch (err) {
        console.error('관리 데이터 조회 오류:', err);
        setError('관리 데이터를 불러오는데 실패했습니다.');
        // 개발 중에는 임시 데이터 사용
        setPresentPoint(5);
        setAbsentPoint(-10);
        setLatePoint(-2);
        setStudyStatus('PROGRESS');
      } finally {
        setLoading(false);
      }
    };
    
    fetchManagementData();
  }, [studyId]);

  // 회원 목록 가져오기
  useEffect(() => {
    if (managementTab === '회원') {
      fetchMembers();
    }
  }, [managementTab, studyId]);

  // 회원 목록 API 호출 함수
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 올바른 API 경로로 요청
      const response = await api.get(`/studies/${studyId}/management/members`, {
        withCredentials: true
      });
      console.log('회원 목록 조회 결과:', response);
      
      // 응답이 배열이 아닌 경우 members 필드로 접근 (API 명세 변경 가능성에 대비)
      const membersList = Array.isArray(response.data) ? response.data : response.data.members || [];
      setMembers(membersList);
      
      // 현재 사용자 정보 찾기 (첫 번째 멤버가 현재 사용자라고 가정)
      if (membersList.length > 0) {
        const currentUser = membersList[0]; // 또는 로그인한 사용자 ID와 일치하는 멤버를 찾는 로직 필요
        setCurrentUserRole(currentUser.memberRole);
      }
    } catch (err) {
      console.error('회원 목록 조회 오류:', err);
      setError('회원 목록을 불러오는데 실패했습니다.');
      // 개발 중에는 임시 데이터 사용 (CREATOR 역할 포함)
      setMembers([
        { memberId: 1, studentName: '회원1 (생성자)', studentEmail: 'creator@example.com', memberRole: 'CREATOR', studyName: '테스트 스터디' },
        { memberId: 2, studentName: '회원2 (관리자)', studentEmail: 'host@example.com', memberRole: 'HOST' },
        { memberId: 3, studentName: '회원3', studentEmail: 'member1@example.com', memberRole: 'PARTICIPANT' },
        { memberId: 4, studentName: '회원4', studentEmail: 'member2@example.com', memberRole: 'PARTICIPANT' }
      ]);
      
      // 목업 데이터에서도 현재 사용자 역할 가정
      setCurrentUserRole('CREATOR');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStudyImageFile(file);
      // 이미지 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setStudyImageUrl(previewUrl);
    }
  };

  const handleSave = async () => {
    try {
      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("토큰 없음, 스터디 정보 수정 불가");
        setError("인증 토큰이 없습니다. 로그인이 필요합니다.");
        return;
      }

      // FormData 객체 생성하여 모든 데이터를 한 번에 보냄
      const formData = new FormData();
      formData.append('studyName', studyName);
      formData.append('studyContent', studyContent);
      formData.append('studyGoogleFormUrl', studyGoogleFormUrl || '');
      formData.append('presentPoint', presentPoint);
      formData.append('absentPoint', absentPoint);
      formData.append('latePoint', latePoint);
      
      // 이미지 파일이 있는 경우 추가
      if (studyImageFile) {
        formData.append('file', studyImageFile);
      }

      // 통합 API 요청 - 한 번에 모든 정보 업데이트
      const response = await api.put(`/studies/${studyId}/management`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      console.log("스터디 정보 수정 성공:", response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("스터디 정보 수정에 실패했습니다.", err);
      setError("스터디 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderStudyStatus = () => {
    switch (studyStatus) {
      case "PROGRESS":
        return (
          <StatusItem>
            <BsPatchCheckFill color="green" />
            <StatusLabel>스터디 상태:</StatusLabel>
            <StatusValue>진행 중</StatusValue>
          </StatusItem>
        );
      case "COMPLETED":
        return (
          <StatusItem>
            <ImCheckboxUnchecked color="blue" />
            <StatusLabel>스터디 상태:</StatusLabel>
            <StatusValue>완료됨</StatusValue>
          </StatusItem>
        );
      case "PENDING":
        return (
          <StatusItem>
            <MdOutlineAccessTimeFilled color="orange" />
            <StatusLabel>스터디 상태:</StatusLabel>
            <StatusValue>대기 중</StatusValue>
          </StatusItem>
        );
      default:
        return (
          <StatusItem>
            <StatusLabel>스터디 상태:</StatusLabel>
            <StatusValue>알 수 없음</StatusValue>
          </StatusItem>
        );
    }
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <LoadingIcon />
      </LoadingWrapper>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <ManagementTabContainer>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          스터디 관리
        </h2>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setManagementTab('스터디')}
            style={{
              backgroundColor: managementTab === '스터디' ? '#000000' : '#FFFFFF',
              color: managementTab === '스터디' ? 'white' : '#000',
              border: managementTab === '스터디' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            스터디
          </button>
          <button 
            onClick={() => setManagementTab('회원')}
            style={{
              backgroundColor: managementTab === '회원' ? '#000000' : '#FFFFFF',
              color: managementTab === '회원' ? 'white' : '#000',
              border: managementTab === '회원' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            회원
          </button>
          <button 
            onClick={() => setManagementTab('포인트')}
            style={{
              backgroundColor: managementTab === '포인트' ? '#000000' : '#FFFFFF',
              color: managementTab === '포인트' ? 'white' : '#000',
              border: managementTab === '포인트' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            포인트
          </button>
        </div>
      </div>
      
      {/* 회원 관리 컴포넌트 */}
      {managementTab === '회원' && (
        <MemberManagement 
          members={members} 
          loading={loading} 
          error={error} 
          fetchMembers={fetchMembers} 
        />
      )}
      
      {/* 스터디 관리 컴포넌트 */}
      {managementTab === '스터디' && (
        <>
          {isEditing ? (
            <>
              <div style={{ marginBottom: '24px' }}>
                <TabTitle>스터디 정보 수정</TabTitle>
              </div>
              
              <InputContainer>
                <InputLabel>스터디 이름</InputLabel>
                <Input
                  type="text"
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value)}
                  placeholder="스터디 이름"
                />
              </InputContainer>
              
              <InputContainer>
                <InputLabel>소개</InputLabel>
                <TextArea
                  value={studyContent}
                  onChange={(e) => setStudyContent(e.target.value)}
                  placeholder="스터디 설명"
                  rows={4}
                />
              </InputContainer>
              
              <InputContainer>
                <InputLabel>이미지</InputLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ flex: 1 }}
                  />
                  {studyImageUrl && (
                    <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '4px' }}>
                      <img 
                        src={studyImageUrl} 
                        alt="스터디 이미지" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  )}
                </div>
              </InputContainer>
              
              <InputContainer>
                <InputLabel>구글폼링크(선택)</InputLabel>
                <Input
                  type="text"
                  value={studyGoogleFormUrl}
                  onChange={(e) => setStudyGoogleFormUrl(e.target.value)}
                  placeholder="구글 폼 URL"
                />
              </InputContainer>
              
              <TabTitle>출석 점수 설정</TabTitle>
              <PointContainer>
                <InputContainer>
                  <InputLabel>출석 점수</InputLabel>
                  <Input
                    type="number"
                    value={presentPoint}
                    onChange={(e) => setPresentPoint(parseInt(e.target.value))}
                  />
                </InputContainer>
                
                <InputContainer>
                  <InputLabel>결석 점수</InputLabel>
                  <Input
                    type="number"
                    value={absentPoint}
                    onChange={(e) => setAbsentPoint(parseInt(e.target.value))}
                  />
                </InputContainer>
                
                <InputContainer>
                  <InputLabel>지각 점수</InputLabel>
                  <Input
                    type="number"
                    value={latePoint}
                    onChange={(e) => setLatePoint(parseInt(e.target.value))}
                  />
                </InputContainer>
              </PointContainer>
              
              <ButtonContainer>
                <SaveButton onClick={handleSave}>저장</SaveButton>
                <CancelButton onClick={handleCancel}>취소</CancelButton>
              </ButtonContainer>
            </>
          ) : (
            <>
              <StatusContainer>
                <StatusItem>
                  <StatusLabel>스터디 이름:</StatusLabel>
                  <StatusValue>{studyName}</StatusValue>
                </StatusItem>
                
                <StatusItem>
                  <StatusLabel>스터디 설명:</StatusLabel>
                  <StatusValue>{studyContent}</StatusValue>
                </StatusItem>
                
                {studyGoogleFormUrl && (
                  <StatusItem>
                    <StatusLabel>구글 폼:</StatusLabel>
                    <StatusValue>
                      <a href={studyGoogleFormUrl} target="_blank" rel="noopener noreferrer">
                        {studyGoogleFormUrl}
                      </a>
                    </StatusValue>
                  </StatusItem>
                )}
                
                {renderStudyStatus()}
              </StatusContainer>
              
              {studyImageUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <img 
                    src={studyImageUrl} 
                    alt="스터디 이미지" 
                    style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '4px' }} 
                  />
                </div>
              )}
              
              <TabTitle>출석 점수 설정</TabTitle>
              <PointContainer>
                <PointItem>
                  <PointLabel>
                    <BsPatchCheckFill color="green" /> 출석:
                  </PointLabel>
                  <PointValue>{presentPoint > 0 ? `+${presentPoint}` : presentPoint} 점</PointValue>
                </PointItem>
                
                <PointItem>
                  <PointLabel>
                    <GrFormClose color="red" /> 결석:
                  </PointLabel>
                  <PointValue>{absentPoint > 0 ? `+${absentPoint}` : absentPoint} 점</PointValue>
                </PointItem>
                
                <PointItem>
                  <PointLabel>
                    <MdOutlineAccessTimeFilled color="orange" /> 지각:
                  </PointLabel>
                  <PointValue>{latePoint > 0 ? `+${latePoint}` : latePoint} 점</PointValue>
                </PointItem>
              </PointContainer>
              
              <ButtonContainer>
                <SaveButton onClick={handleEdit}>수정</SaveButton>
              </ButtonContainer>
            </>
          )}
        </>
      )}
      
      {/* 포인트 관리 컴포넌트 */}
      {managementTab === '포인트' && (
        <PointManagement 
          presentPoint={presentPoint} 
          absentPoint={absentPoint} 
          latePoint={latePoint} 
        />
      )}
    </ManagementTabContainer>
  );
}

export default ManagementTab; 