import { useState } from 'react'
import { postService } from '../../services/api'

function PostForm() {
  const [postData, setPostData] = useState({
    postTitle: '',
    postContent: '',
    postImage: '',
    categoryId: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await postService.createPost(postData)
      console.log('Post created:', response)
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={postData.postTitle}
        onChange={(e) => setPostData({ ...postData, postTitle: e.target.value })}
      />
      {/* Add more form fields */}
      <button type="submit">Create Post</button>
    </form>
  )
}

export default PostForm 