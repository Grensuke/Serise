import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import { apiFetch } from '../../utils/api'
import { login } from '../../utils/auth'

const Login = () => {
  const emailRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Please enter your email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email'
    if (!password) e.password = 'Please enter a password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.msg || 'Login failed')
      login(data.token)
      setLoading(false)
      navigate('/dashboard')
    } catch (err) {
      setLoading(false)
      setErrors({ form: err.message })
      console.error('Login error', err)
    }
  }

  return (
    <section className={styles.authSection} aria-labelledby="login-heading">
      <div className={styles.authContainer}>
        <div className={styles.leftCol}>
          <Link to="/" className={styles.brandSmall}>Serise</Link>
          <div className={styles.trio} aria-hidden>
            <div className={styles.trioLine}>Calm.</div>
            <div className={styles.trioLineAccent}>Clarity.</div>
            <div className={styles.trioLine}>Confidence.</div>
          </div>
          <div className={styles.copy}>© 2025 Serise Inc.</div>
        </div>

        <aside className={styles.rightCol}>
          <div className={styles.cardWrap}>
            <div className={styles.loginCard}>
              <h1 id="login-heading" className={styles.loginTitle}>Login</h1>

              <form className={styles.form} onSubmit={onSubmit} noValidate>
                {errors.form && (
                  <div className={styles.error} role="alert">{errors.form}</div>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    id="email"
                    ref={emailRef}
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={errors.email ? true : false}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <div id="email-error" className={styles.error} role="alert">{errors.email}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>Password</label>
                  <input
                    id="password"
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={errors.password ? true : false}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <div id="password-error" className={styles.error} role="alert">{errors.password}</div>
                  )}
                </div>

                <button className={styles.btnPrimary} type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>

                <div className={styles.formFooter}>
                  <Link className={styles.link} to="/auth/forgot">Forgot password?</Link>
                  <Link className={styles.link} to="/auth/signup">Create account</Link>
                </div>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Login
