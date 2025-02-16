import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await api.get('/login/user')
        setUser(data)  // { email, nickname, department, phoneNumber, ... }
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUserInfo()
  }, [])

  // 사용자 정보 업데이트 함수 제공
  const updateUserInfo = async (newInfo) => {
    try {
      const { data } = await api.patch('/update', newInfo)
      setUser(data)
      return true
    } catch (error) {
      return false
    }
  }

  return { 
    user, 
    loading,
    updateUserInfo  // 사용자 정보 업데이트 함수 제공
  }
} 