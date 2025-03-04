import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

function MyPage() {
  const navigate = useNavigate()
  const { user, refreshUserInfo, isDetailedUserInfo } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 페이지 로드 시 사용자 상세 정보 조회
  useEffect(() => {
    const loadUserDetails = async () => {
      // 이미 상세 정보가 있으면 다시 조회하지 않음
      if (isDetailedUserInfo) {
        setLoading(false)
        return
      }

      try {
        console.log('[MyPage] 사용자 상세 정보 조회 시작')
        setLoading(true)
        await refreshUserInfo()
        console.log('[MyPage] 사용자 상세 정보 조회 완료')
      } catch (error) {
        console.error('[MyPage] 사용자 정보 조회 실패:', error)
        setError('사용자 정보를 불러오는데 실패했습니다.')
        
        // 인증 오류인 경우 로그인 페이지로 이동
        if (error.response?.status === 401) {
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserDetails()
  }, [refreshUserInfo, isDetailedUserInfo, navigate])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!user) {
    return <ErrorMessage message="사용자 정보가 없습니다." />
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        내 프로필
      </h1>

      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#495057'
          }}>
            기본 정보
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            gap: '0.5rem',
            fontSize: '16px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#6c757d' }}>이름:</div>
            <div>{user.studentName || user.nickname || '정보 없음'}</div>
            
            <div style={{ fontWeight: 'bold', color: '#6c757d' }}>이메일:</div>
            <div>{user.email || '정보 없음'}</div>
            
            <div style={{ fontWeight: 'bold', color: '#6c757d' }}>학교:</div>
            <div>{user.studentSchool || '정보 없음'}</div>
            
            <div style={{ fontWeight: 'bold', color: '#6c757d' }}>학과:</div>
            <div>{user.studentDepartment || user.department || '정보 없음'}</div>
            
            <div style={{ fontWeight: 'bold', color: '#6c757d' }}>전화번호:</div>
            <div>{user.studentPhoneNumber || '정보 없음'}</div>
          </div>
        </div>

        {!isDetailedUserInfo && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '0.75rem',
            borderRadius: '4px',
            marginTop: '1rem',
            fontSize: '14px'
          }}>
            일부 사용자 정보만 표시되고 있습니다. 전체 정보를 보려면 페이지를 새로고침 해주세요.
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/studies')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '14px',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            스터디 목록으로 돌아가기
          </button>
          
          <button
            onClick={() => refreshUserInfo()}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            정보 새로고침
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyPage 