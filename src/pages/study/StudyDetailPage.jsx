import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { IoHomeOutline } from 'react-icons/io5';
import StudySidebar from '../../components/study/StudySidebar';
import StudyContent from '../../components/study/StudyContent';

function StudyDetailPage() {
  const { studyId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [studyData, setStudyData] = useState({
    title: "스터디 이름",
    description: "스터디 소개"
  });

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
          to="/studies"
          style={{
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
          스터디
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
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#F8F9FA'
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
