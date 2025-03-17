import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { IoHomeOutline } from 'react-icons/io5';
import StudySidebar from '../../components/study/StudySidebar';
import StudyContent from '../../components/study/StudyContent';

function StudyDetailPage() {
  const { studyId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [studyData, setStudyData] = useState({
    title: "로딩 중...",
    description: "스터디 정보를 불러오는 중입니다."
  });
  
  // 이미 로드된 스터디 데이터를 추적하기 위한 ref
  const studyDataLoaded = useRef(false);

  // location state에서 스터디 데이터 가져오기 - 초기에 한 번만 실행
  useEffect(() => {
    // 이미 로드된 경우 다시 실행하지 않음
    if (studyDataLoaded.current) return;
    
    // 이전 페이지에서 전달받은 스터디 데이터 확인
    const passedStudyData = location.state?.studyData;
    
    console.log('[StudyDetailPage] 전달받은 스터디 데이터:', passedStudyData);
    
    if (passedStudyData) {
      // 전달받은 데이터가 있으면 사용
      setStudyData(passedStudyData);
    } else {
      // 전달받은 데이터가 없으면 기본값 설정 (스터디 뒤에 ID 추가하지 않고 스터디 이름만 표시)
      setStudyData({
        title: `스터디 ${studyId}`, // 실제 환경에서는 API로 스터디 이름을 가져와야 함
        description: "스터디 설명이 없습니다."
      });
      
      console.log('[StudyDetailPage] 전달받은 스터디 데이터가 없어 기본값 사용');
    }
    
    // 데이터가 로드되었음을 표시
    studyDataLoaded.current = true;
  }, [studyId]); // location.state 의존성 제거

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
