import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([
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
  ]);

  useEffect(() => {
    if (activeTab === '과제') {
      // TODO: API 연동 후 과제 목록 불러오기
      setAssignments([
        {
          id: 1,
          title: '[기말 프로젝트]',
          dueDate: '2025.3.2',
          status: '진행중',
        },
        {
          id: 2,
          title: '[중간 프로젝트]',
          dueDate: '2025.2.1',
          status: '완료',
          score: '10/10',
        },
      ]);
    }
  }, [activeTab]);

  const renderScheduleContent = () => (
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

  const renderAssignmentContent = () => (
    <div style={{ width: '100%' }}>
      <div style={{
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold'
        }}>과제</h1>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {assignments.map((assignment) => (
          <div 
            key={assignment.id}
            style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <h2 style={{
              fontSize: '18px',
              marginBottom: '12px'
            }}>{assignment.title}</h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#666'
            }}>
              <span style={{ fontSize: '14px' }}>{assignment.dueDate}</span>
              <span style={{
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0'
              }}>{assignment.status}</span>
              {assignment.score && (
                <span style={{
                  fontSize: '14px',
                  color: '#000',
                  fontWeight: 'bold'
                }}>{assignment.score}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDefaultContent = () => (
    <>
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
          {studyData?.description || "스터디 소개가 없습니다."}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem'
      }}>
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

  const renderContent = () => {
    switch (activeTab) {
      case '일정':
        return renderScheduleContent();
      case '과제':
        return renderAssignmentContent();
      case '공지사항':
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
        return renderDefaultContent();
    }
  };

  return (
    <div style={{ 
      flex: 1,
      minWidth: 0,
      paddingRight: '1rem'
    }}>
      {renderContent()}
    </div>
  );
}

StudyContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  studyData: PropTypes.shape({
    description: PropTypes.string,
  }),
};

export default StudyContent; 