import SideBar from "../../components/study/layout/SideBar";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { studyService } from "../../services/api";
import NoticeList from "../../components/study/notice/NoticeList";
import NoticeDetail from "../../components/study/notice/NoticeDetail";
import PropTypes from "prop-types";
import ErrorMessage from "../../components/common/ErrorMessage";

function StudyDetailPage() {
  const { studyId } = useParams();
  const [activeSection, setActiveSection] = useState("study-detail");
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchNotices = async () => {
      setIsLoading(true);
      setError(null);  // 새로운 요청 시작 시 에러 초기화
      try {
        const data = await studyService.getNotices(studyId);
        if (isMounted) {  // 컴포넌트가 마운트된 상태일 때만 상태 업데이트
          setNotices(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('공지사항 목록 조회 실패:', error);
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (activeSection === 'notice') {
      fetchNotices();
    }

    return () => {
      isMounted = false;  // 컴포넌트 언마운트 시 플래그 변경
    };
  }, [studyId, activeSection]);

  return (
    <div className="flex">
      <SideBar
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />
      <div className="flex-1 p-6">
        {error && <ErrorMessage message={error} className="mb-4" />}
        {activeSection === 'notice' && (
          selectedNoticeId ? (
            <NoticeDetail 
              studyId={studyId}
              noticeId={selectedNoticeId} 
              onBack={() => setSelectedNoticeId(null)}
            />
          ) : (
            <NoticeList 
              notices={notices} 
              onNoticeClick={setSelectedNoticeId}
              isLoading={isLoading}
            />
          )
        )}
      </div>
    </div>
  );
}

export default StudyDetailPage;
