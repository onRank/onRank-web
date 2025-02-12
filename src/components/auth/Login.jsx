import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true)
    try {
      console.log('Login Success:', credentialResponse)
      const decoded = jwtDecode(credentialResponse.credential)
      console.log('Decoded:', decoded)
      
      const response = await fetch('/login/oauth/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with backend');
      }
      
      const data = await response.json();
      console.log('Backend response:', data);

      // 회원정보 존재 여부에 따라 리다이렉션
      if (data.isNewUser) {
        // 새로운 사용자는 회원정보 입력 페이지로
        navigate('/register');
      } else {
        // 기존 사용자는 스터디 페이지로
        navigate('/studies');
      }
      
    } catch (error) {
      console.error('Login Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = (error) => {
    console.error('Login Failed:', error)
  }

  return (
    <div className="login-container">
      <h2>Welcome to ONRANK</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          select_account={true}
          flow="implicit"
          auto_select={false}
          ux_mode="popup"
          cancel_on_tap_outside={false}
        />
      )}
    </div>
  )
}

export default Login 