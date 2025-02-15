import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function OAuthAddForm({ onSubmit, isLoading }) {
  const { user } = useAuth()  // 기존 사용자 정보 가져오기
  const [formData, setFormData] = useState({
    email: user?.email || '',  // 이메일은 이미 있음
    name: user?.name || '',    // 이름도 이미 있음
    nickname: '',
    phoneNumber: '',
    department: ''
  })

  // ... 나머지 코드
}

export default OAuthAddForm 