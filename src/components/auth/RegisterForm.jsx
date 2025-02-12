import { useState } from 'react'
import PropTypes from 'prop-types'

function RegisterForm({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    email: initialData.email || '',
    name: initialData.name || '',
    nickname: '',
    phoneNumber: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="nickname">닉네임</label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          required
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
        />
      </div>

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? '처리중...' : '가입 완료'}
      </button>
    </form>
  )
}

RegisterForm.propTypes = {
  initialData: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
}

export default RegisterForm 