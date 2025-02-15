import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/check')
        setUser(data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  return { user, loading }
} 