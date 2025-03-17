import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { IoHomeOutline } from 'react-icons/io5';
import StudySidebar from '../../components/study/StudySidebar';
import StudyContent from '../../components/study/StudyContent';
import { studyService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

function StudyDetailPage() {
  const { studyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [studyData, setStudyData] = useState({
    title: "로딩 중...",
    description: "스터디 정보를 불러오는 중입니다."
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 이미 로드된 스터디 데이터를 추적하기 위한 ref
  const studyDataLoaded = useRef(false);

  // 스터디 데이터 로드
  useEffect(() => {
    // 이미 로드된 경우 다시 실행하지 않음
    if (studyDataLoaded.current) return;
    
    const fetchStudyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 이전 페이지에서 전달받은 스터디 데이터 확인
        const passedStudyData = location.state?.studyData;
        
        console.log('[StudyDetailPage] 전달받은 스터디 데이터:', passedStudyData);
        console.log('[StudyDetailPage] URL에서 추출한 studyId:', studyId);
        
        if (passedStudyData) {
          // 전달받은 데이터가 있으면 사용
          setStudyData(passedStudyData);
          setIsLoading(false);
        } else {
          // 전달받은 데이터가 없으면 API에서 studyId로 조회 시도
          console.log('[StudyDetailPage] API를 통해 스터디 데이터 조회 시도');
          
          try {
            // studyId를 사용하여 API 호출
            const data = await studyService.getStudyById(studyId);
            
            console.log('[StudyDetailPage] API 응답 데이터:', data);
            
            if (data) {
              // 백엔드 필드명을 프론트엔드 필드명으로 매핑
              const mappedData = {
                id: data.studyId,
                title: data.studyName || '제목 없음',
                description: data.studyContent || '설명 없음',
                currentMembers: data.members?.length || 0,
                maxMembers: 10,
                status: '모집중',
                imageUrl: data.studyImageUrl || ''
              };
              
              setStudyData(mappedData);
            } else {
              // 데이터가 없으면 기본값 설정
              setStudyData({
                title: `스터디 (ID: ${studyId})`,
                description: "스터디 정보를 찾을 수 없습니다."
              });
              
              setError("스터디 정보를 찾을 수 없습니다.");
            }
          } catch (apiError) {
            console.error('[StudyDetailPage] API 호출 중 오류:', apiError);
            
            // 오류 발생 시 기본값 설정
            setStudyData({
              title: `스터디 (ID: ${studyId})`,
              description: "스터디 정보를 불러오는 중 오류가 발생했습니다."
            });
            
            setError(`스터디 정보를 불러오는 중 오류가 발생했습니다: ${apiError.message || '알 수 없는 오류'}`);
          }
          
          setIsLoading(false);
        }
        
        // 데이터가 로드되었음을 표시
        studyDataLoaded.current = true;
      } catch (error) {
        console.error('[StudyDetailPage] 데이터 로드 중 오류:', error);
        setIsLoading(false);
        setError(`데이터 로드 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        studyDataLoaded.current = true;
      }
    };
    
    fetchStudyData();
  }, [studyId, location.state]);

  // URL에서 현재 섹션 가져오기
  useEffect(() => {
    const path = location.pathname;
    const section = path.split('/').pop();
    
    console.log('Current path:', path);
    console.log('Section:', section);
    
    // studyId로 끝나는 경우 (기본 화면)
    if (section === studyId) {
      setActiveTab('');
      return;
    }

    const tabMap = {
      'notices': '공지사항',
      'schedule': '일정',
      'assignment': '과제',
      'board': '게시판',
      'attendance': '출석',
      'management': '관리',
      'ranking': '랭킹'
    };
    
    console.log('Tab mapping:', tabMap[section]);
    
    if (tabMap[section]) {
      setActiveTab(tabMap[section]);
      console.log('Active tab set to:', tabMap[section]);
    } else {
      console.log('No matching tab for section:', section);
    }
  }, [location.pathname, studyId]);

  // 로딩 중 표시
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {/* 경로 표시 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        fontSize: '14px',
        color: '#666666',
        width: '100%'
      }}>
        <Link 
          to="/studies"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#666666',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8F9FA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <IoHomeOutline size={16} />
        </Link>
        <span>{'>'}</span>
        <Link
          to={`/studies/${studyId}`}
          style={{
            color: activeTab ? '#666666' : '#FF0000',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: activeTab ? 'normal' : 'bold'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8F9FA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {studyData.title}
        </Link>
        {activeTab && (
          <>
            <span>{'>'}</span>
            <span style={{ 
              color: '#FF0000',
              fontWeight: 'bold',
              padding: '2px 4px'
            }}>
              {activeTab}
            </span>
          </>
        )}
      </div>

      {/* 오류 메시지 표시 */}
      {error && <ErrorMessage message={error} />}

      {/* 메인 컨텐츠 */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        width: '100%',
        position: 'relative'
      }}>
        <StudySidebar activeTab={activeTab} />
        <StudyContent activeTab={activeTab} studyData={studyData} />
      </div>
    </div>
  );
}

export default StudyDetailPage;
