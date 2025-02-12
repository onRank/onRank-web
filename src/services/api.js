import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // process.env 대신 import.meta.env 사용
  headers: {
    'Content-Type': 'application/json',
  },
})

export const postService = {
  getPosts: () => api.get('/posts'),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`)
}

export const studentService = {
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData)
    return response.data
  },
  // Add more student-related API calls
}

export default api 