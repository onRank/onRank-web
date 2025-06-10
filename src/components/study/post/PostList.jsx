import PropTypes from "prop-types";
import PostListItem from "./PostListItem";
import { useTheme } from "../../../contexts/ThemeContext";
import "../../../styles/post.css";

function PostList({ posts, onPostClick, onEdit, onDelete, isLoading }) {
  const { colors } = useTheme(); // eslint-disable-line no-unused-vars

  if (isLoading) return <div className="loading-message">로딩중...</div>;

  if (!posts || posts.length === 0) {
    return <div className="empty-message">등록된 게시글이 없습니다.</div>;
  }

  const totalItems = posts.length;

  return (
    <div className="post-items">
      {posts.map((post, index) => (
        <PostListItem
          key={post.postId}
          post={post}
          onClick={() => onPostClick(post.postId)}
          onEdit={onEdit}
          onDelete={onDelete}
          index={index}
          totalItems={totalItems}
        />
      ))}
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      postId: PropTypes.number.isRequired,
      postTitle: PropTypes.string,
    })
  ).isRequired,
  onPostClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default PostList;
