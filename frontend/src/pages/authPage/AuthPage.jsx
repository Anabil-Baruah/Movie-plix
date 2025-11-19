import React, { useState, useEffect } from 'react'
import './authPage.scss'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/authSlice'
import { register, login as loginService } from '../../services/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiFilm } from 'react-icons/fi'
import logo from '../../assets/MoviePlix-logo.svg'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/'
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, location])

    // Clear errors when switching modes
    useEffect(() => {
        setErrors({})
        setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        })
        dispatch(clearError())
    }, [isLogin, dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (isLogin) {
            if (!formData.email && !formData.username) {
                newErrors.email = 'Email or username is required'
            }
            if (!formData.password) {
                newErrors.password = 'Password is required'
            }
        } else {
            if (!formData.email) {
                newErrors.email = 'Email is required'
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid'
            }
            if (!formData.username) {
                newErrors.username = 'Username is required'
            } else if (formData.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters'
            }
            if (!formData.password) {
                newErrors.password = 'Password is required'
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters'
            }
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password'
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        dispatch(loginStart())

        try {
            let response
            if (isLogin) {
                response = await loginService({
                    email: formData.email || undefined,
                    username: formData.username || undefined,
                    password: formData.password
                })
            } else {
                response = await register({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password
                })
            }
            
            dispatch(loginSuccess(response))
            const from = location.state?.from?.pathname || '/'
            navigate(from, { replace: true })
        } catch (err) {
            dispatch(loginFailure(err.message || `${isLogin ? 'Login' : 'Registration'} failed`))
            setErrors({ submit: err.message || `${isLogin ? 'Login' : 'Registration'} failed` })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-left">
                    <div className="auth-branding">
                        <div className="logo-container">
                            <img src={logo} alt="MoviePlix" className="logo" />
                        </div>
                        <h1 className="brand-title">Welcome to MoviePlix</h1>
                        <p className="brand-subtitle">
                            Your ultimate destination for movies and TV shows. 
                            Stream unlimited content anytime, anywhere.
                        </p>
                        <div className="feature-list">
                            <div className="feature-item">
                                <FiFilm className="feature-icon" />
                                <span>Unlimited Streaming</span>
                            </div>
                            <div className="feature-item">
                                <FiFilm className="feature-icon" />
                                <span>HD Quality Content</span>
                            </div>
                            <div className="feature-item">
                                <FiFilm className="feature-icon" />
                                <span>Personalized Recommendations</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-tabs">
                            <button
                                className={`tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Sign In
                            </button>
                            <button
                                className={`tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FiMail className="input-icon" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className={errors.email ? 'error' : ''}
                                    />
                                    {errors.email && (
                                        <span className="field-error">{errors.email}</span>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor={isLogin ? "email" : "username"}>
                                    {isLogin ? (
                                        <>
                                            <FiMail className="input-icon" />
                                            Email or Username
                                        </>
                                    ) : (
                                        <>
                                            <FiUser className="input-icon" />
                                            Username
                                        </>
                                    )}
                                </label>
                                <input
                                    type={isLogin ? "text" : "text"}
                                    id={isLogin ? "email" : "username"}
                                    name={isLogin ? "email" : "username"}
                                    value={isLogin ? formData.email : formData.username}
                                    onChange={handleChange}
                                    placeholder={isLogin ? "Enter email or username" : "Choose a username"}
                                    className={errors.email || errors.username ? 'error' : ''}
                                />
                                {(errors.email || errors.username) && (
                                    <span className="field-error">
                                        {errors.email || errors.username}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <FiLock className="input-icon" />
                                    Password
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className={errors.password ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="field-error">{errors.password}</span>
                                )}
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <FiLock className="input-icon" />
                                        Confirm Password
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            className={errors.confirmPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="field-error">{errors.confirmPassword}</span>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    isLogin ? 'Sign In' : 'Sign Up'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage
