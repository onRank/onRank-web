import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import { useNotice, NoticeProvider } from "../../../components/study/notice/NoticeProvider";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import NoticeForm from "../../../components/study/notice/NoticeForm";
import NoticeEditForm from "../../../components/study/notice/NoticeEditForm";
import useStudyRole from "../../../hooks/useStudyRole";
import Button from "../../../components/common/Button";
import '../../../styles/notice.css';

// 실제 컨텐츠를 처리하는 내부 컨테이너
const NoticeInnerContainer = ({ onSubPageChange }) => {
  const { studyId, noticeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isNewForm, setIsNewForm] = useState(false);
  const [isEditForm, setIsEditForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);

  // Notice Context 사용
  const { 
    notices, 
    selectedNotice: contextNotice, 
    isLoading: contextLoading, 
    error, 
    memberRole,
    getNotices, 
    getNoticeById, 
    createNotice, 
    editNotice, 
    deleteNotice 
  } = useNotice();

  // 권한 훅 사용
  const { isManager } = useStudyRole();

  // URL 상태 확인
  useEffect(() => {
    const path = location.pathname;
    // Check if the URL ends with /add or contains /new for create page
    const isCreatePage = path.endsWith('/notices/add') || path.includes('/notices/new');
    // Check if the URL contains /edit/ for edit page
    const isEditPage = path.includes('/notices/edit/');
    // Check if the URL has a noticeId but is not edit or create page
    const isDetailPage = noticeId && !isEditPage && !isCreatePage;

    setIsNewForm(isCreatePage);
    setIsEditForm(isEditPage);
    setIsDetailView(isDetailPage);

    // URL 파라미터가 있으면 해당 공지사항 로드
    if (noticeId && !contextNotice) {
      getNoticeById(studyId, noticeId);
    }

    // 하위 페이지 상태 업데이트
    if (isCreatePage) {
      onSubPageChange("추가");
    } else if (isEditPage) {
      onSubPageChange("수정");
    } else if (isDetailPage) {
      onSubPageChange("상세");
    } else {
      onSubPageChange(null);
    }

    return () => {
      onSubPageChange(null);
    };
  }, [location.pathname, noticeId, studyId, contextNotice, getNoticeById, onSubPageChange]);

  // 공지사항 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (!notices || notices.length === 0) {
      getNotices(studyId);
    }
  }, [studyId, notices, getNotices]);

  useEffect(() => {
    if (contextNotice && noticeId && parseInt(noticeId) === contextNotice.noticeId) {
      setSelectedNotice(contextNotice);
    }
  }, [contextNotice, noticeId]);

  // 로딩 상태 통합
  useEffect(() => {
    setIsLoading(contextLoading);
  }, [contextLoading]);

  // 공지사항 클릭 핸들러
  const handleNoticeClick = (noticeId) => {
    navigate(`/studies/${studyId}/notices/${noticeId}`, { 
      replace: true, 
      state: { fromNoticeList: true } 
    });
  };

  // 공지사항 추가 페이지로 이동
  const handleCreateNotice = () => {
    navigate(`/studies/${studyId}/notices/add`, { 
      replace: true 
    });
  };

  // 공지사항 수정 페이지로 이동
  const handleEditNotice = (noticeId) => {
    navigate(`/studies/${studyId}/notices/edit/${noticeId}`, { 
      replace: true 
    });
  };

  // 공지사항 삭제 핸들러
  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      const result = await deleteNotice(studyId, noticeId);
      if (result.success) {
        // 삭제 후 목록으로 이동
        navigate(`/studies/${studyId}/notices`, { 
          replace: true 
        });
      } else {
        alert('공지사항 삭제에 실패했습니다.');
      }
    }
  };

  // 공지사항 생성 제출 핸들러
  const handleSubmitCreate = async (noticeData, files) => {
    try {
      console.log("[NoticeContainer] 공지사항 생성 요청:", { studyId, noticeData });
      const result = await createNotice(studyId, noticeData, files);
      if (result.success) {
        // 생성 후 목록으로 이동
        navigate(`/studies/${studyId}/notices`, { 
          replace: true 
        });
        return true;
      } else {
        alert(result.message || '공지사항 생성에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error("[NoticeContainer] 공지사항 생성 오류:", error);
      alert('공지사항 생성에 실패했습니다.');
      return false;
    }
  };

  // 공지사항 수정 제출 핸들러
  const handleSubmitEdit = async (noticeId, noticeData, files) => {
    const result = await editNotice(studyId, noticeId, noticeData, files);
    if (result.success) {
      // 수정 후 상세 페이지로 이동
      navigate(`/studies/${studyId}/notices/${noticeId}`, { 
        replace: true 
      });
      return true;
    } else {
      alert(result.message || '공지사항 수정에 실패했습니다.');
      return false;
    }
  };

  // 취소 버튼 핸들러 (목록으로 돌아가기)
  const handleCancel = () => {
    navigate(`/studies/${studyId}/notices`, { 
      replace: true 
    });
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    if (isNewForm) {
      return (
        <div>
          <h1 className="page-title">공지사항 추가</h1>
          <NoticeForm
            onSubmit={handleSubmitCreate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      );
    }

    if (isEditForm && selectedNotice) {
      return (
        <div>
          <h1 className="page-title">공지사항 수정</h1>
          <NoticeEditForm
            notice={selectedNotice}
            onSubmit={(data, files) => handleSubmitEdit(selectedNotice.noticeId, data, files)}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      );
    }

    if (isDetailView && selectedNotice) {
      return (
        <div>
          <h1 className="page-title">공지사항 상세</h1>
          <NoticeDetail
            notice={selectedNotice}
            onEdit={() => handleEditNotice(selectedNotice.noticeId)}
            onDelete={() => handleDeleteNotice(selectedNotice.noticeId)}
            onBack={handleCancel}
            isManager={isManager}
          />
        </div>
      );
    }

    // 기본 리스트 뷰
    return (
      <div>
        <h1 className="page-title">공지사항</h1>

        {isManager && (
          <div className="notice-add-box">
            <div>
              <div className="notice-add-title">공지사항 추가</div>
              <div className="notice-add-description">새로운 공지사항을 추가해주세요.</div>
            </div>
            <Button variant="add" onClick={handleCreateNotice} />
          </div>
        )}

        {isLoading ? (
          <div className="notice-loading">로딩중...</div>
        ) : error ? (
          <div className="notice-error">{error}</div>
        ) : notices && notices.length === 0 ? (
          <div className="notice-empty">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <NoticeList
            notices={notices || []}
            onNoticeClick={handleNoticeClick}
            onEdit={isManager ? handleEditNotice : undefined}
            onDelete={isManager ? handleDeleteNotice : undefined}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%', 
      maxWidth: '100%',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        position: 'relative',
        padding: '0 1rem',
        marginTop: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

NoticeInnerContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired,
};

// NoticeProvider로 감싸는 컨테이너 컴포넌트
function NoticeContainer({ onSubPageChange }) {
  return (
    <NoticeProvider>
      <NoticeInnerContainer onSubPageChange={onSubPageChange} />
    </NoticeProvider>
  );
}

NoticeContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired,
};

export default NoticeContainer; 