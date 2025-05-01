import PropTypes from "prop-types";
import PostCard from "./PostCard";
import LoadingSpinner from "../../common/LoadingSpinner";

function PostList({
  posts,
  onPostClick,
  onEditPost,
  onDeletePost,
  handleCreate,
  isLoading,
}) {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="bg-white border rounded-lg overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 게시판이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.postId}>
                <PostCard
                  post={post}
                  onClick={() => onPostClick(post.postId)}
                  onEdit={() => onEditPost(post.postId)}
                  onDelete={() => onDeletePost(post.postId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      postId: PropTypes.number.isRequired,
      postTitle: PropTypes.string.isRequired,
      postContent: PropTypes.string,
      postCreatedAt: PropTypes.string.isRequired,
      postModifiedAt: PropTypes.string.isRequired,
      postWritenBy: PropTypes.string.isRequired,
      files: PropTypes.arrayOf(
        PropTypes.shape({
          fileId: PropTypes.number.isRequired,
          fileName: PropTypes.string.isRequired,
          fileUrl: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  onPostClick: PropTypes.func.isRequired,
  onEditPost: PropTypes.func,
  onDeletePost: PropTypes.func,
  handleCreate: PropTypes.func.isRequired,
};

export default PostList;
