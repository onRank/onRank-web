import { GoogleLogin } from '@react-oauth/google'

function GoogleLoginButton() {
  return (
    <a 
      href={`${import.meta.env.VITE_API_URL}/oauth`}
      className="google-login-button"
    >
      Google로 로그인하기
    </a>
  )
}

export default GoogleLoginButton 