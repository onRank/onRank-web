import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import "../../../styles/board.css";

function BoardCreate({ onSubmit, onCancel, isLoading }) {
  const { studyId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 필드에 값이 입력되면 해당 필드의 오류 메시지 제거
    if (value.trim() !== "") {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "제목을 입력해주세요.";
    }
    if (!formData.content.trim()) {
      errors.content = "내용을 입력해주세요.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const success = await onSubmit({
        ...formData,
        studyId,
      });

      if (success) {
        onCancel(); // 성공 시 목록 페이지로 이동
      }
    } catch (error) {
      console.error("게시글 생성 중 오류 발생:", error);
      // 오류 처리 로직 추가 가능
    }
  };

  return (
    <div className="board-create-container">
      <h2>게시글 작성</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
          />
          {formErrors.title && <div className="form-error">{formErrors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="content" className="form-label">내용</label>
          <textarea
            id="content"
            name="content"
            className="form-control textarea"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows={10}
          ></textarea>
          {formErrors.content && <div className="form-error">{formErrors.content}</div>}
        </div>
        
        <div className="form-buttons">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            style={{ marginRight: "10px" }}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "등록"}
          </Button>
        </div>
      </form>
    </div>
  );
}

BoardCreate.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default BoardCreate; 