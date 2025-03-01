import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { IoHomeOutline } from 'react-icons/io5';

function StudyDetailPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('일정');

  // URL에서 현재 섹션 가져오기
  useEffect(() => {
    const path = location.pathname;
    const section = path.split('/').pop();
    
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
      'manage': '관리',
      'ranking': '랭킹'
    };
    if (tabMap[section]) {
      setActiveTab(tabMap[section]);
    }
  }, [location.pathname, studyId]);

  // 임시 데이터
  const study = {
    title: "스터디 이름",
    description: "스터디 소개"
  };

  // 임시 일정 데이터
  const schedules = [
    { 
      id: 1, 
      round: 1,
      date: '2024.03.25',
      content: '1회차 - React 기초 학습\n- React 소개\n- Component와 Props\n- State와 생명주기' 
    },
    { 
      id: 2, 
      round: 2,
      date: '2024.04.01',
      content: '2회차 - React Hooks\n- useState\n- useEffect\n- Custom Hooks 만들기' 
    },
    { 
      id: 3, 
      round: 3,
      date: '2024.04.08',
      content: '3회차 - React Router\n- Router 설정\n- Route와 Link\n- URL 파라미터와 쿼리스트링' 
    },
    { 
      id: 4, 
      round: 4,
      date: '2024.04.15',
      content: '4회차 - 상태 관리\n- Context API\n- Redux 기초\n- Redux Toolkit 사용법' 
    }
  ];

  const menuItems = [
    { id: 'notices', label: '공지사항', path: 'notices' },
    { id: 'schedule', label: '일정', path: 'schedule' },
    { id: 'assignment', label: '과제', path: 'assignment' },
    { id: 'board', label: '게시판', path: 'board' },
    { id: 'attendance', label: '출석', path: 'attendance' },
    { id: 'manage', label: '관리', path: 'manage' },
    { id: 'ranking', label: '랭킹', path: 'ranking' },
  ];

  const handleTabClick = (path, label) => {
    setActiveTab(label);
    navigate(`/studies/${studyId}/${path}`);
  };

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case '일정':
        return (
          <div style={{ width: '100%' }}>
            {schedules.map((schedule) => (
              <div 
                key={schedule.id}
                style={{
                  marginBottom: '2rem',
                  width: '100%',
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '1.5rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '1px',
                    height: '16px',
                    backgroundColor: '#FF0000',
                    marginRight: '0.5rem'
                  }} />
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {schedule.round}회차
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: '#666666',
                    marginLeft: '1rem'
                  }}>
                    {schedule.date}
                  </span>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#333333',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.6'
                }}>
                  {schedule.content}
                </div>
              </div>
            ))}
          </div>
        );
      case '공지사항':
      case '과제':
      case '게시판':
      case '출석':
      case '관리':
      case '랭킹':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>
            {activeTab} 탭 컨텐츠가 준비중입니다.
          </div>
        );
      default:
        return (
          <>
            {/* 스터디 소개 */}
            <div style={{
              marginBottom: '2rem',
              padding: '2rem',
              border: '1px solid #E5E5E5',
              borderRadius: '4px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                스터디 소개
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666666',
                whiteSpace: 'pre-line'
              }}>
                {study.description}
              </p>
            </div>

            {/* 랭킹 & 보증금 */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              {/* 보증금 */}
              <div style={{
                flex: 1,
                padding: '2rem',
                backgroundColor: '#F8F9FA',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  marginBottom: '1rem'
                }}>
                  보증금
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '24px' }}>💰</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>0원</span>
                </div>
              </div>

              {/* 상금 */}
              <div style={{
                flex: 1,
                padding: '2rem',
                backgroundColor: '#FFF9C4',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  marginBottom: '1rem'
                }}>
                  상금
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '24px' }}>💰</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>0원</span>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div>
      {/* 경로 표시 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        fontSize: '14px',
        color: '#666666'
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
          {study.title}
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
        gap: '2rem'
      }}>
        {/* 왼쪽 사이드바 */}
        <div style={{
          width: '200px',
          borderRight: '1px solid #E5E5E5'
        }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.path, item.label)}
              style={{
                width: '100%',
                padding: '1rem',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: activeTab === item.label ? '#FF0000' : '#000000',
                fontWeight: activeTab === item.label ? 'bold' : 'normal',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#F8F9FA'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F9FA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 오른쪽 컨텐츠 */}
        <div style={{ flex: 1 }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default StudyDetailPage;
