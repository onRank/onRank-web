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
import MemberManagement from './management/MemberManagement';
import StudyManagement from './management/StudyManagement';
import PointManagement from './management/PointManagement';
import { handleStudyImageUpload } from '../../../utils/imageUtils';

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
  const imageRef = useRef(null);

  // 관리 탭 데이터 가져오기
  useEffect(() => {
    fetchManagementData();
  }, [studyId]);

  // 데이터 가져오는 함수
  const fetchManagementData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/studies/${studyId}/management`, {
        withCredentials: true
      });
      
      // 응답 구조 확인 (디버깅)
      console.log('관리 데이터 응답:', response.data);
      
      // data 필드 접근
      const { data } = response.data;
      
      // 데이터 설정
      setStudyName(data.studyName);
      setStudyContent(data.studyContent);
      
      // 이미지 URL 추출 및 처리
      if (response.data.memberContext && response.data.memberContext.file && response.data.memberContext.file.fileUrl) {
        // 원본 S3 URL 그대로 사용
        const imageUrl = response.data.memberContext.file.fileUrl;
        console.log('원본 이미지 URL:', imageUrl);
        
        // S3 URL을 그대로 사용
        setStudyImageUrl(imageUrl);
      }
      
      setStudyGoogleFormUrl(data.studyGoogleFormUrl || "");
      setPresentPoint(data.presentPoint);
      setAbsentPoint(data.absentPoint);
      setLatePoint(data.latePoint);
      setStudyStatus(data.studyStatus);
      
      // 회원 정보 설정 (memberContext가 있는 경우)
      if (response.data.memberContext) {
        setCurrentUserRole(response.data.memberContext.memberRole);
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
    
    // 이미지 파일 선택 상태 초기화
    setStudyImageFile(null);
    
    // 원래 데이터로 복원 (서버에서 다시 가져오기)
    fetchManagementData();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("이미지 파일 선택됨:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      setStudyImageFile(file);
      // 이미지 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setStudyImageUrl(previewUrl);
      
      console.log("이미지 상태 업데이트 완료:", {
        file: file.name,
        previewUrl: previewUrl.substring(0, 30) + "..."
      });
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

      console.log("저장 시작 - 이미지 파일 상태:", {
        exists: !!studyImageFile,
        name: studyImageFile?.name,
        size: studyImageFile?.size,
        type: studyImageFile?.type,
        previewUrl: studyImageUrl?.substring(0, 30) + "..."
      });

      setLoading(true);
      setError(null);

      // 요청 데이터 생성 (JSON 형식)
      const requestData = {
        studyName: studyName,
        studyContent: studyContent,
        studyGoogleFormUrl: studyGoogleFormUrl || '',
        presentPoint: presentPoint,
        absentPoint: absentPoint,
        latePoint: latePoint,
        fileName: studyImageFile ? studyImageFile.name : null
      };

      console.log("스터디 정보 수정 요청 데이터:", requestData);

      // 백엔드 API 호출 (JSON 형식으로 전송)
      const response = await api.put(`/studies/${studyId}/management`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log("스터디 정보 수정 응답:", response.data);
      console.log("응답 구조 확인:", {
        hasData: !!response.data.data,
        dataProps: response.data.data ? Object.keys(response.data.data) : [],
        hasUploadUrl: !!response.data.data?.uploadUrl,
        uploadUrl: response.data.data?.uploadUrl ? (response.data.data.uploadUrl.substring(0, 50) + "...") : "없음"
      });
      
      // 이미지 파일이 있는 경우 S3에 직접 업로드
      if (studyImageFile) {
        console.log("이미지 업로드 프로세스 시작 - 파일 존재");
        try {
          // 응답에서 uploadUrl 추출
          const uploadUrl = response.data.data?.uploadUrl;
          
          if (!uploadUrl) {
            console.error("응답에서 uploadUrl을 찾을 수 없음:", response.data);
            throw new Error("업로드 URL을 받지 못했습니다.");
          }
          
          console.log("uploadUrl 확인:", uploadUrl.substring(0, 80) + "...");
          
          // S3에 직접 업로드
          await uploadImageToS3(uploadUrl, studyImageFile);
          console.log("S3 이미지 업로드 완료");
          
          // 업로드 성공 후 이미지 URL 업데이트
          if (response.data.memberContext?.file?.fileUrl) {
            setStudyImageUrl(response.data.memberContext.file.fileUrl);
          }
        } catch (uploadError) {
          console.error("S3 이미지 업로드 중 예외 발생:", uploadError);
          setError("스터디 정보는 업데이트되었으나 이미지 업로드에 실패했습니다.");
          setIsEditing(false);
          setLoading(false);
          return;
        }
      } else {
        console.log("이미지 파일이 없어 업로드 건너뜀");
      }

      console.log("스터디 정보 수정 성공");
      setIsEditing(false);
      
      // 업데이트 후 서버에서 최신 데이터 다시 가져오기
      setTimeout(() => {
        fetchManagementData();
      }, 1000);
    } catch (err) {
      console.error("스터디 정보 수정에 실패했습니다.", err);
      setError("스터디 정보 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
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

  // 이미지 부분을 렌더링하는 코드
  const renderStudyImage = () => {
    if (!studyImageUrl) {
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
        {/* 이미지가 blob URL(로컬 파일 선택)인지 확인 */}
        {studyImageUrl.startsWith('blob:') ? (
          <img 
            ref={imageRef}
            src={studyImageUrl} 
            alt="스터디 이미지 (미리보기)" 
            style={{ 
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: '4px', 
              border: '1px solid #000',
              backgroundColor: '#FFF',
              display: 'block'
            }} 
          />
        ) : (
          <div 
            style={{
              backgroundImage: `url(${studyImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '500px',
              height: '350px',
              borderRadius: '4px', 
              border: '1px solid #000',
              backgroundColor: '#FFF'
            }}
            aria-label="스터디 이미지"
          />
        )}
      </div>
    );
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
      
      {/* 스터디 관리 컴포넌트 - 뷰 모드 */}
      {managementTab === '스터디' && !isEditing && (
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
          
          <div style={{ marginBottom: '20px' }}>
            <h3>스터디 이미지</h3>
            {renderStudyImage()}
            
            {studyImageUrl && (
              <div style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>이미지 URL:</p>
                <p style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{studyImageUrl}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <a 
                    href={studyImageUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block',
                      color: '#0066cc',
                      textDecoration: 'underline'
                    }}
                  >
                    새 탭에서 이미지 열기
                  </a>
                  <button
                    onClick={fetchManagementData}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.8rem',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    이미지 새로고침
                  </button>
                </div>
              </div>
            )}
          </div>
          
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
      
      {/* 스터디 관리 컴포넌트 - 편집 모드 */}
      {managementTab === '스터디' && isEditing && (
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
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              {/* 이미지 미리보기 먼저 표시 */}
              {studyImageUrl && (
                <div style={{ 
                  width: '400px', 
                  height: '300px', 
                  overflow: 'hidden', 
                  borderRadius: '8px', 
                  border: '2px solid #ddd',
                  margin: '0 auto 15px auto'
                }}>
                  {/* 이미지 미리보기 */}
                  <div 
                    style={{
                      backgroundImage: `url(${studyImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                    aria-label="스터디 이미지 미리보기"
                  />
                </div>
              )}
              
              {/* 파일 선택 버튼 */}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ 
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
              />
            </div>
            {studyImageUrl && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.8rem', 
                color: '#666',
                textAlign: 'center'
              }}>
                현재 이미지가 표시됩니다. 변경하려면 새 이미지를 선택하세요.
              </div>
            )}
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