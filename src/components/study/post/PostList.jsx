import PropTypes from "prop-types";
import PostListItem from "./PostListItem";
import { useTheme } from "../../../contexts/ThemeContext";

function PostList({ posts, onPostClick, onEdit, onDelete, isLoading }) {
  const { colors } = useTheme(); // eslint-disable-line no-unused-vars

  if (isLoading) return <div className="loading-message">로딩중...</div>;

  return (
    <div className="post-list-container">
      {posts.length === 0 ? (
        <div className="empty-message">등록된 게시글이 없습니다.</div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostListItem
              key={post.postId}
              post={post}
              onClick={() => onPostClick(post.postId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
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
