import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentService } from '../services/api'

function UserRegistration() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    studentName: '',
    department: '',
    phoneNumber: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await studentService.createStudent(formData)
      console.log('Registration success:', response)
      
      // 성공 메시지 표시 (선택사항)
      alert('회원가입이 완료되었습니다!')
      
      // studies 페이지로 이동
      navigate('/studies')
    } catch (error) {
      console.error('Registration failed:', error)
      setError(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="registration-container">
      <h2>회원정보 입력</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>이름</label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({
              ...formData,
              studentName: e.target.value
            })}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label>학과</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({
              ...formData,
              department: e.target.value
            })}
            optional
            disabled={isLoading}
          />
        </div>
        <div>
          <label>전화번호</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({
              ...formData,
              phoneNumber: e.target.value
            })}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  )
}

export default UserRegistration 