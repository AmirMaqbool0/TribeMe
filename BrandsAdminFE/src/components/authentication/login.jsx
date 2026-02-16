'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUsers, updateField, clearState, setDeviceType, setIpAddress } from '@/redux/Auth Slices/loginSlice'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image'
import images from '@/src/assets/images';



const Login = () => {
  const dispatch = useDispatch()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter()

  const { email, password, loading, errors = {}, isAuthenticated } = useSelector((state) => state.login);

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const submitRef = useRef(null)



  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        dispatch(clearState());
        router.push('/home');
        dispatch(clearState());
      }, 3000);
    }

  }, [isAuthenticated, router, dispatch])



  const handleLogin = e => {
    e.preventDefault()

    if (!email || !password) {
      return;
    }

    // The data to be sent to the backend
    const credentials = {
      email,
      password,
    };

    dispatch(loginUsers(credentials));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ field: name, value })); 
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      if (e.target.name === 'email') {
        passwordRef.current.focus() // Focus on password when Enter is pressed on email
      } else if (e.target.name === 'password') {
        submitRef.current.click() // Submit the form when Enter is pressed on password
      }
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className='min-h-screen flex items-center bg-Red justify-center p-3 font-outfit'>
      <div className='bg-white shadow-lg rounded-lg sm:p-8 p-5 max-w-md w-full'>
        <h1 className='text-2xl font-bold mb-2 text-gray-700 text-center'>
          Login
        </h1>
        <div className="flex justify-center mb-2">
          <Image src={images.logo.tribeme} alt="Brand Logo" width={150} height={150} className="object-contain" />
        </div>
        <form onSubmit={handleLogin} className='space-y-4' autoComplete='off'>
          {/* EMAIL */}
          <div>
            <label htmlFor='email' className='font-medium block text-gray-600'>
              Email Address
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              ref={emailRef}
              className='w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500'
              placeholder='Enter your email'
              autoComplete='email'
            />
            {errors.email && (
              <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor='password'
              className='font-medium block text-gray-600'
            >
              Password
            </label>
            <div className='relative'>
              <input
                type={isPasswordVisible ? "text" : "password"}
                id='password'
                name='password'
                value={password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                ref={passwordRef}
                className='w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500'
                placeholder='Enter your password'
                autoComplete='current-password'
              />
              {/* Password visibility toggle */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
            )}
          </div>

          {/* LOGIN */}
          <button
            type='submit'
            ref={submitRef}
            className='w-full bg-Red text-white py-2 rounded-md hover:bg-Red-400 transition'
            disabled={loading || errors.email || errors.password}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login


