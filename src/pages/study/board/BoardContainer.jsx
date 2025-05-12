import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import useStudyRole from "../../../hooks/useStudyRole";
import { boardService } from "../../../services/board";
import BoardListPage from "./BoardListPage";
import BoardDetail from "./BoardDetail";
import BoardCreate from "./BoardCreate";
import BoardEdit from "./BoardEdit";

function BoardContainer({ onSubPageChange }) {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const { studyId, boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // useStudyRole 훅 사용
  const { memberRole, updateMemberRoleFromResponse } = useStudyRole();
  
  // 현재 경로를 확인하여 어떤 컴포넌트를 표시할지 결정
  const isAddPage = location.pathname.endsWith('/add');
  const isEditPage = location.pathname.includes('/edit');
  const isDetailPage = boardId && !isEditPage && !isAddPage;
  
  // boardId가 URL에 있는 경우 해당 게시글 상세 정보 조회
  useEffect(() => {
    const fetchBoardDetail = async () => {
      if (boardId) {
        try {
          setIsLoading(true);
          setError(null);
          
          // API를 통해 게시글 상세 정보 조회
          const response = await boardService.getBoardById(studyId, boardId);
          
          if (response.success && response.data) {
            setSelectedBoard(response.data);
            
            // 멤버 컨텍스트 정보가 있으면 업데이트
            if (response.memberContext) {
              updateMemberRoleFromResponse(response, studyId);
            }
          } else {
            setError(response.message || "해당 게시글을 찾을 수 없습니다.");
          }
        } catch (error) {
          console.error("[BoardContainer] 게시글 상세 조회 실패:", error);
          setError("게시글 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (boardId) {
      fetchBoardDetail();
    }
  }, [boardId, studyId, updateMemberRoleFromResponse]);
  
  // 게시글 목록 조회
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API를 통해 게시글 목록 조회
        const response = await boardService.getBoards(studyId);
        
        // 멤버 컨텍스트 정보 처리
        if (response.memberContext) {
          updateMemberRoleFromResponse(response, studyId);
        }
        
        if (response.success) {
          setBoards(response.data || []);
        } else {
          setError(response.message || "게시글을 불러오는 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("[BoardContainer] 게시글 데이터 조회 실패:", error);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAddPage && !boardId) {
      fetchBoards();
    }
  }, [studyId, isAddPage, updateMemberRoleFromResponse, boardId]);

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

  // 게시글 추가 핸들러
  const handleAddBoard = async (newBoard, selectedFiles) => {
    try {
      setIsLoading(true);

      // API 요청 데이터에 파일 추가
      const boardData = {
        ...newBoard,
        files: selectedFiles // 파일 데이터 추가
      };

      // API를 통해 게시글 생성 (파일 포함)
      const result = await boardService.createBoard(studyId, boardData);
      
      if (result.success) {
        // 멤버 컨텍스트 정보가 있으면 업데이트
        if (result.memberContext) {
          updateMemberRoleFromResponse(result, studyId);
        }
        
        // 새로운 게시글 목록 조회 (또는 상태 업데이트)
        const updatedBoardsResponse = await boardService.getBoards(studyId);
        if (updatedBoardsResponse.success) {
          setBoards(updatedBoardsResponse.data || []);
        } else {
          // 응답에서 게시글 데이터를 받았다면 목록에 추가
          if (result.data) {
            setBoards(prevBoards => [result.data, ...prevBoards]);
          }
        }
        
        return true;
      } else {
        setError(result.message || "게시글 추가에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("[BoardContainer] 게시글 추가 실패:", error);
      setError(`게시글 추가에 실패했습니다: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 삭제 핸들러
  const handleDeleteBoard = async (boardId) => {
    try {
      setIsLoading(true);

      // API를 통해 게시글 삭제
      const result = await boardService.deleteBoard(studyId, boardId);
      
      if (result.success) {
        // 멤버 컨텍스트 정보가 있으면 업데이트
        if (result.memberContext) {
          updateMemberRoleFromResponse(result, studyId);
        }
        
        // 게시글 목록에서 삭제된 게시글 제거
        setBoards(prevBoards => prevBoards.filter(board => board.boardId !== parseInt(boardId)));
        
        return true;
      } else {
        setError(result.message || "게시글 삭제에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("[BoardContainer] 게시글 삭제 실패:", error);
      setError(`게시글 삭제에 실패했습니다: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 수정 핸들러
  const handleUpdateBoard = async (boardId, updatedBoard, selectedFiles) => {
    try {
      setIsLoading(true);

      // API 요청 데이터에 파일 추가
      const boardData = {
        ...updatedBoard,
        files: selectedFiles // 파일 데이터 추가
      };

      // API를 통해 게시글 수정 (파일 포함)
      const result = await boardService.updateBoard(studyId, boardId, boardData);
      
      if (result.success) {
        // 멤버 컨텍스트 정보가 있으면 업데이트
        if (result.memberContext) {
          updateMemberRoleFromResponse(result, studyId);
        }
        
        // 상세 정보 다시 조회
        const updatedBoardResponse = await boardService.getBoardById(studyId, boardId);
        if (updatedBoardResponse.success && updatedBoardResponse.data) {
          // 선택된 게시글 정보 업데이트
          setSelectedBoard(updatedBoardResponse.data);
          
          // 목록의 게시글 정보도 업데이트
          setBoards(prevBoards => prevBoards.map(board => 
            board.boardId === parseInt(boardId) 
              ? updatedBoardResponse.data 
              : board
          ));
        } else {
          // API에서 업데이트된 정보를 가져오지 못할 경우 로컬 데이터로 업데이트
          const updatedBoardData = {
            boardId: parseInt(boardId),
            boardTitle: updatedBoard.title,
            boardContent: updatedBoard.content,
            boardUpdatedAt: new Date().toISOString(),
          };
          
          // 선택된 게시글 정보 업데이트
          setSelectedBoard(prev => ({
            ...prev,
            ...updatedBoardData
          }));
          
          // 목록의 게시글 정보도 업데이트
          setBoards(prevBoards => prevBoards.map(board => 
            board.boardId === parseInt(boardId) 
              ? { ...board, ...updatedBoardData } 
              : board
          ));
        }
        
        return true;
      } else {
        setError(result.message || "게시글 수정에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("[BoardContainer] 게시글 수정 실패:", error);
      setError(`게시글 수정에 실패했습니다: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // 게시글 상세 보기로 전환
  const handleViewBoardDetail = (board) => {
    setSelectedBoard(board);
    
    // 상세 페이지로 이동
    navigate(`/studies/${studyId}/boards/${board.boardId}`, {
      state: { board }
    });
  };
  
  // 게시글 목록 보기로 돌아가기
  const handleBackToBoardList = () => {
    setSelectedBoard(null);
    navigate(`/studies/${studyId}/boards`);
  };
  
  // 게시글 추가 페이지로 이동
  const handleNavigateToAddPage = () => {
    navigate(`/studies/${studyId}/boards/add`, {
      state: {
        breadcrumb: "게시판 > 추가"
      }
    });
  };
  
  // 게시글 수정 페이지로 이동
  const handleNavigateToEditPage = (boardId) => {
    navigate(`/studies/${studyId}/boards/${boardId}/edit`, {
      state: {
        breadcrumb: "게시판 > 수정"
      }
    });
  };
  
  // 게시글 목록 페이지로 이동
  const handleNavigateToListPage = () => {
    navigate(`/studies/${studyId}/boards`);
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    if (isAddPage) {
      return (
        <BoardCreate
          onSubmit={handleAddBoard}
          onCancel={handleNavigateToListPage}
          isLoading={isLoading}
        />
      );
    }
    
    if (isEditPage && selectedBoard) {
      return (
        <BoardEdit
          board={selectedBoard}
          onSubmit={handleUpdateBoard}
          onCancel={handleNavigateToListPage}
          isLoading={isLoading}
        />
      );
    }
    
    if (isDetailPage && selectedBoard) {
      return (
        <BoardDetail
          board={selectedBoard}
          onBack={handleBackToBoardList}
          onEdit={handleNavigateToEditPage}
          onDelete={handleDeleteBoard}
          isLoading={isLoading}
        />
      );
    }

    return (
      <BoardListPage
        boards={boards}
        onAddBoard={handleNavigateToAddPage}
        onDeleteBoard={handleDeleteBoard}
        onViewBoardDetail={handleViewBoardDetail}
        isLoading={isLoading}
        error={error}
        memberRole={memberRole}
      />
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
            게시판
          </h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

BoardContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired,
};

export default BoardContainer; 