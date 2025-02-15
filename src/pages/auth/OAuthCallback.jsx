import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const isNewUser = params.get('isNewUser')

    if (isNewUser === 'true') {
      navigate('/oauth/add')
    } else {
      navigate('/studies')
    }
  }, [navigate, location])

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return <LoadingSpinner />
}

export default OAuthCallback 