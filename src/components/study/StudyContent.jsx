import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ScheduleTab from './tabs/ScheduleTab';
import AssignmentTab from './tabs/AssignmentTab';
import DefaultContent from './tabs/DefaultContent';
import ManagementTab from './tabs/ManagementTab';

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const { studyId } = useParams();

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

  const renderContent = () => {
    console.log('StudyContent - activeTab:', activeTab);
    
    switch (activeTab) {
      case '일정':
        return <ScheduleTab schedules={schedules} setSchedules={setSchedules} />;
      case '과제':
        return <AssignmentTab assignments={assignments} />;
      case '관리':
        console.log('Rendering management content');
        return <ManagementTab studyData={studyData} />;
      case '공지사항':
      case '게시판':
      case '출석':
      case '랭킹':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>
            {activeTab} 탭 컨텐츠가 준비중입니다.
          </div>
        );
      default:
        console.log('Rendering default content');
        return <DefaultContent studyData={studyData} />;
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
    title: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default StudyContent; 