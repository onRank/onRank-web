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
  
  // Notice Context 사용
  const { 
    notices, 
    selectedNotice, 
    isLoading: contextLoading, 
    error, 
    getNotices, 
    getNoticeById, 
    createNotice, 
    editNotice, 
    deleteNotice 
  } = useNotice();

  // 권한 훅 사용
  const { isManager } = useStudyRole();
  
  // 현재 경로를 분석하여 페이지 타입 결정
  const isAddPage = location.pathname.endsWith('/add');
  const isEditPage = location.pathname.includes('/edit');
  const isDetailPage = noticeId && !isEditPage && !isAddPage;

  // 컴포넌트 마운트 시 공지사항 목록 로드
  useEffect(() => {
    if (!isAddPage && !noticeId && (!notices || notices.length === 0)) {
      getNotices(studyId);
    }
  }, [studyId, notices, getNotices, isAddPage, noticeId]);

  // noticeId가 URL에 있는 경우 해당 공지사항 상세 정보 조회
  useEffect(() => {
    if (noticeId) {
      getNoticeById(studyId, noticeId);
    }
  }, [studyId, noticeId, getNoticeById]);
  
  // subPage 상태 관리 및 콜백 호출
  useEffect(() => {
    if (isAddPage) {
      onSubPageChange("추가");
    } else if (isEditPage) {
      onSubPageChange("수정");
    } else if (isDetailPage) {
      onSubPageChange("상세");
    } else {
      onSubPageChange(null);
    }
    // 컴포넌트 언마운트 시 subPage 초기화
    return () => {
      onSubPageChange(null);
    };
  }, [isAddPage, isEditPage, isDetailPage, onSubPageChange]);

  // 로딩 상태 통합
  useEffect(() => {
    setIsLoading(contextLoading);
  }, [contextLoading]);

  // 공지사항 상세 보기로 전환
  const handleViewNoticeDetail = (noticeId) => {
    navigate(`/studies/${studyId}/notices/${noticeId}`);
  };

  // 공지사항 추가 페이지로 이동
  const handleNavigateToAddPage = () => {
    navigate(`/studies/${studyId}/notices/add`);
  };

  // 공지사항 수정 페이지로 이동
  const handleNavigateToEditPage = (noticeId) => {
    navigate(`/studies/${studyId}/notices/${noticeId}/edit`);
  };

  // 공지사항 목록 페이지로 이동
  const handleNavigateToListPage = () => {
    navigate(`/studies/${studyId}/notices`);
  };

  // 공지사항 삭제 핸들러
  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      const result = await deleteNotice(studyId, noticeId);
      if (result.success) {
        handleNavigateToListPage();
      } else {
        alert(result.message || '공지사항 삭제에 실패했습니다.');
      }
    }
  };

  // 공지사항 생성 제출 핸들러
  const handleSubmitCreate = async (noticeData, files) => {
    try {
      setIsLoading(true);
      console.log("[NoticeContainer] 공지사항 생성 요청:", { studyId, noticeData });
      
      const result = await createNotice(studyId, noticeData, files);
      
      if (result.success) {
        handleNavigateToListPage();
        return true;
      } else {
        alert(result.message || '공지사항 생성에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error("[NoticeContainer] 공지사항 생성 오류:", error);
      alert('공지사항 생성에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 공지사항 수정 제출 핸들러
  const handleSubmitEdit = async (noticeId, noticeData, files) => {
    try {
      setIsLoading(true);
      
      const result = await editNotice(studyId, noticeId, noticeData, files);
      
      if (result.success) {
        // 수정 후 상세 페이지로 이동
        navigate(`/studies/${studyId}/notices/${noticeId}`);
        return true;
      } else {
        alert(result.message || '공지사항 수정에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error("[NoticeContainer] 공지사항 수정 오류:", error);
      alert('공지사항 수정에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    // 공지사항 추가 페이지
    if (isAddPage) {
      return (
        <NoticeForm
          onSubmit={handleSubmitCreate}
          onCancel={handleNavigateToListPage}
          isLoading={isLoading}
        />
      );
    }
    
    // 공지사항 수정 페이지
    if (isEditPage && selectedNotice) {
      return (
        <NoticeEditForm
          studyId={studyId}
          noticeId={noticeId}
          initialData={selectedNotice}
          onCancel={handleNavigateToListPage}
          onSaveComplete={() => navigate(`/studies/${studyId}/notices/${noticeId}`)}
        />
      );
    }
    
    // 공지사항 상세 페이지
    if (isDetailPage && selectedNotice) {
      return (
        <NoticeDetail
          studyId={studyId}
          noticeId={selectedNotice.noticeId}
          handleBack={handleNavigateToListPage}
          handleEdit={isManager ? () => handleNavigateToEditPage(selectedNotice.noticeId) : undefined}
          handleDelete={isManager ? handleDeleteNotice : undefined}
        />
      );
    }

    // 기본 공지사항 목록 페이지
    return (
      <>
        {isManager && (
          <div className="notice-add-box">
            <div>
              <div className="notice-add-title">공지사항 추가</div>
              <div className="notice-add-description">새로운 공지사항을 추가해주세요.</div>
            </div>
            <Button variant="add" onClick={handleNavigateToAddPage} />
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
            onNoticeClick={handleViewNoticeDetail}
            onEdit={isManager ? handleNavigateToEditPage : undefined}
            onDelete={isManager ? handleDeleteNotice : undefined}
            isLoading={isLoading}
          />
        )}
      </>
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
          <h1 className="page-title">
            {isAddPage ? "공지사항 추가" : 
             isEditPage ? "공지사항 수정" : 
             isDetailPage ? "공지사항 상세" : "공지사항"}
          </h1>
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