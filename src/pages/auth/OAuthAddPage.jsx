import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'  // api.js에서 authService import
import { useAuth } from '../../contexts/AuthContext'

function OAuthAddPage() {
  const navigate = useNavigate()
  const { user, updateUserInfo } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nickname: '',
    phoneNumber: '',
    department: ''  // 학과 정보 추가
  })

  useEffect(() => {
    if (user?.nickname) {
      navigate('/studies')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePhoneNumber = (number) => {
    return /^01[0-9]{8,9}$/.test(number.replace(/-/g, ''))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('올바른 전화번호 형식이 아닙니다.')
      return
    }
    setIsLoading(true)
    try {
      const success = await updateUserInfo(formData)
      if (success) {
        navigate('/studies')
      } else {
        setError('회원정보 등록에 실패했습니다.')
      }
    } catch (error) {
      setError('회원정보 등록에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="oauth-add-container">
      <h2>회원 정보 입력</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">전화번호</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="01012345678"
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">학과</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading}
        >
          {isLoading ? '처리중...' : '가입 완료'}
        </button>
      </form>
    </div>
  )
}

export default OAuthAddPage 