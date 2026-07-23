import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient' // Adjust this import path to wherever your supabase client is initialized

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard')
      }
    })
  }, [navigate])

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>Verifying your session...</p>
    </div>
  )
}