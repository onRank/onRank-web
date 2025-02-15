import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

function Profile() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  
  return (
    <div>
      <h2>프로필</h2>
      <p>이메일: {user.email}</p>
      <p>이름: {user.name}</p>
      <p>닉네임: {user.nickname}</p>
    </div>
  )
}

export default Profile 