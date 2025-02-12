import { GoogleLogin } from '@react-oauth/google'

function GoogleLoginButton({ onSuccess, isLoading }) {
  const handleError = (error) => {
    console.error('Login Failed:', error)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={handleError}
      useOneTap={false}
      select_account={true}
      flow="implicit"
      auto_select={false}
      ux_mode="popup"
      cancel_on_tap_outside={false}
    />
  )
}

export default GoogleLoginButton 