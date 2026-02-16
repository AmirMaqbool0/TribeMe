'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUsers, updateField, clearState } from '@/redux/Auth Slices/loginSlice'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import './style.css'
import images from '@/src/assets/images'

const Login = () => {
  // State and Refs
  const dispatch = useDispatch()
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  
  // Redux state
  const { email, password, loading, errors = {}, isAuthenticated } = useSelector((state) => state.login)
  
  // Refs for focus management
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const submitRef = useRef(null)

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        dispatch(clearState())
        router.push('/home')
      }, 3000)
    }
  }, [isAuthenticated, router, dispatch])

  // Form handlers
  const handleLogin = e => {
    e.preventDefault()

    if (!email || !password) return

    dispatch(loginUsers({ email, password }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    dispatch(updateField({ field: name, value }))
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      if (e.target.name === 'email') {
        passwordRef.current.focus()
      } else if (e.target.name === 'password') {
        submitRef.current.click()
      }
    }
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev)
  }

  return (
    <div className='login-container'>
      <div className="login-form">
        <div className="login-heading">
          <span className='font-outfit'>Login</span>
          <p className='font-outfit'>Login to access your tribeme Admin Portal</p>
        </div>

        <form className="form-wrapper" onSubmit={handleLogin}>
          <div className="floating-label-group">
            <input 
              type="email" 
              id="email" 
              name="email"
              value={email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              ref={emailRef}
              required 
              className='font-outfit' 
            />
            <label htmlFor="email" className='font-outfit'>Email</label>
            {errors.email && (
              <p className='error-message'>{errors.email}</p>
            )}
          </div>

          <div className="floating-label-group">
            <input 
              type={isPasswordVisible ? "text" : "password"} 
              id="password" 
              name="password"
              value={password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              ref={passwordRef}
              required  
              className='font-outfit'
            />
            <label htmlFor="password" className='font-outfit'>Password</label>
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            {errors.password && (
              <p className='error-message'>{errors.password}</p>
            )}
          </div>

          <div className="options-row">
            <label className="remember-me font-outfit">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="forgot-password font-outfit">Forgot Password</a>
          </div>

          <button 
            className="login-button font-outfit" 
            type="submit"
            ref={submitRef}
            disabled={loading || errors.email || errors.password}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

          <p className="signup-text font-outfit">
            Don't have an account? <a href="#">Sign up</a>
          </p>

          <div className="divider font-outfit">Or login with</div>

          <div className="social-buttons">
            <button className="social-btn fb">
                <img src={images.home.facebook} alt="" />
            </button>
            <button className="social-btn google">
              <img src={images.home.google} alt="" />
            </button>
            <button className="social-btn apple">
              <img src={images.home.apple} alt="" />
            </button>
          </div>
        </form>
      </div>
      <div className="login-poster">
        <img src={images.home.login} alt="" />
      </div>
    </div>
  )
}

export default Login