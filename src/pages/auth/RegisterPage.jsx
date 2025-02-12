import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RegisterForm from '../../components/auth/RegisterForm'
import { studentService } from '../../services/api'

function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const { email, name } = location.state || {}

  const handleRegisterSubmit = async (formData) => {
    setIsLoading(true)
    try {
      await studentService.createStudent(formData)
      navigate('/studies')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h2>회원 정보 입력</h2>
      <RegisterForm
        initialData={{ email, name }}
        onSubmit={handleRegisterSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default RegisterPage 