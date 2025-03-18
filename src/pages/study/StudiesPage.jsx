import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import StudyList from "../../components/study/StudyList"
import { studyService, tokenUtils } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ErrorMessage from "../../components/common/ErrorMessage"

function StudiesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [studies, setStudies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageInitialized, setPageInitialized] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // URL 쿼리 파라미터에서 토큰 확인 및 처리
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      console.log('[StudiesPage] 토큰이 URL에서 발견됨, 저장 중...')
      try {
        // URL에서 가져온 토큰 저장
        const decodedToken = decodeURIComponent(tokenFromUrl)
        
        // 토큰 저장 (백업 포함)
        tokenUtils.setToken(decodedToken)
        
        // 토큰 파라미터 제거하고 페이지 리로드 (URL에서 토큰 제거)
        navigate('/studies', { replace: true })
      } catch (e) {
        console.error('[StudiesPage] URL 토큰 처리 중 오류:', e)
      }
    }
  }, [searchParams, navigate])

  // 페이지 로드 시 토큰 복원 시도 (한 번만 실행)
  useEffect(() => {
    if (pageInitialized) return;
    
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      console.log('[StudiesPage] localStorage에 토큰이 없음, 백업에서 복원 시도')
      const restoredToken = tokenUtils.waitForToken(500).catch(() => null)
      
      if (restoredToken) {
        console.log('[StudiesPage] 백업에서 토큰 복원 성공')
      } else {
        console.log('[StudiesPage] 백업 토큰도 없음')
      }
    } else {
      console.log('[StudiesPage] 토큰 확인됨:', accessToken.substring(0, 10) + '...')
    }
    
    setPageInitialized(true);
  }, [pageInitialized])

  // 스터디 목록 로드 (페이지 초기화 후 한 번만 실행)
  useEffect(() => {
    if (!pageInitialized || dataLoaded) return;
    
    const fetchStudies = async () => {
      try {
        console.log('[StudiesPage] 스터디 목록 로드 시도')
        setIsLoading(true)
        setError(null)
        
        // 토큰 확인
        const token = localStorage.getItem('accessToken')
        console.log('[StudiesPage] 토큰 상태:', token ? '있음' : '없음')
        
        if (!token) {
          // 토큰이 없으면 백업에서 복원 시도
          try {
            const restoredToken = await tokenUtils.waitForToken(500)
            if (restoredToken) {
              console.log('[StudiesPage] 토큰 복원 성공, 계속 진행')
            }
          } catch (e) {
            console.log('[StudiesPage] 토큰 복원 실패:', e.message)
            setError('인증 정보가 없습니다. 다시 로그인해주세요.')
            setIsLoading(false)
            setTimeout(() => {
              navigate('/')
            }, 2000)
            return
          }
        }
        
        // 스터디 목록 로드
        const data = await studyService.getStudies()
        console.log('[StudiesPage] 스터디 목록 로드 결과:', data);
        
        // 데이터가 없는 경우 처리
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log('[StudiesPage] 스터디 데이터가 없거나 빈 배열입니다.');
          setStudies([]);
          setIsLoading(false);
          setDataLoaded(true);
          return;
        }
        
        console.log('[StudiesPage] 스터디 목록 로드 성공:', data.length, '개의 스터디');
        
        // 데이터 구조 확인 및 로깅
        if (data.length > 0) {
          console.log('[StudiesPage] 첫 번째 스터디 객체:', data[0]);
          console.log('[StudiesPage] 필드 목록:', Object.keys(data[0]));
        }
        
        setStudies(data);
        setIsLoading(false);
        setDataLoaded(true);
      } catch (error) {
        console.error("[StudiesPage] 스터디 목록 로드 실패:", error)
        
        setError(error.message || '스터디 목록을 불러오는데 실패했습니다.')
        setIsLoading(false)
        setDataLoaded(true);
        
        if (error.response?.status === 401) {
          console.log('[StudiesPage] 인증 실패, 로그인 페이지로 이동')
          navigate('/')
        }
      }
    }

    // 토큰이 있으면 스터디 목록 로드 시도
    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.log('[StudiesPage] 토큰 없음, 로그인 페이지로 이동')
      navigate('/')
      return
    }

    fetchStudies()
  }, [navigate, pageInitialized, dataLoaded])

  // 수동 새로고침 기능 추가
  const handleRefresh = async () => {
    console.log('[StudiesPage] 수동 새로고침 시도');
    setDataLoaded(false);
  };

  // 토큰에서 사용자 정보 추출 (백업 방법)
  const extractUserInfoFromToken = () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) return null;
      
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: tokenPayload.email || '',
        nickname: tokenPayload.nickname || '사용자',
        department: tokenPayload.department || '학과 정보 없음'
      };
    } catch (error) {
      console.error('[StudiesPage] 토큰에서 사용자 정보 추출 실패:', error);
      return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  // 사용자 정보가 없는 경우 토큰에서 추출 시도
  const userInfo = user || extractUserInfoFromToken();
  const userNickname = userInfo?.nickname || '사용자';
  const userDepartment = userInfo?.department || '학과 정보 없음';

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            스터디 목록
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <p>안녕하세요, {userNickname}님!</p>
            <p style={{ color: '#ABB1B3' }}>학과: {userDepartment}</p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          새로고침
        </button>
      </div>
      
      {studies.length > 0 ? (
        <StudyList studies={studies} />
      ) : (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#495057' }}>등록된 스터디가 없습니다</h3>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            참여할 수 있는 스터디가 없거나 아직 스터디에 참여하지 않았습니다.
          </p>
          <button
            onClick={() => navigate('/studies/add')}
            style={{
              backgroundColor: '#4263eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            스터디 생성하기
          </button>
        </div>
      )}
    </div>
  )
}

export default StudiesPage 