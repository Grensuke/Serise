import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Signup.module.css'
import { apiJson } from '../../utils/api'
import { login } from '../../utils/auth'

const Signup = () => {
  const usernameRef = useRef(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const validate = () => {
    const e = {}
    if (!username) e.username = 'Please enter a username'
    if (!email) e.email = 'Please enter your email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email'
    if (!password) e.password = 'Please enter a password'
    if (!confirm) e.confirm = 'Please confirm your password'
    if (password && confirm && password !== confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await apiJson('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: username })
      })
      login(data.token)
      setLoading(false)
      navigate('/dashboard')
    } catch (err) {
      setLoading(false)
      setErrors({ form: err.message })
      console.error('Signup error', err)
    }
  }

  return (
    <section className={styles.authSection} aria-labelledby="signup-heading">
      <div className={styles.authContainer}>
        <div className={styles.leftCol}>
          <Link to="/" className={styles.brandSmall}>Serise</Link>
          <div className={styles.trio} aria-hidden>
            <div className={styles.trioLine}>Confidence,</div>
            <div className={styles.trioLineAccent}>Quietly</div>
            <div className={styles.trioLine}>Built</div>
          </div>
          <div className={styles.copy}>© 2025 Serise Inc.</div>
        </div>

        <aside className={styles.rightCol}>
          <div className={styles.cardWrap}>
            <div className={styles.loginCard}>
              <h1 id="signup-heading" className={styles.loginTitle}>Sign up</h1>

              <form className={styles.form} onSubmit={onSubmit} noValidate>
                {errors.form && (
                  <div className={styles.error} role="alert">{errors.form}</div>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="username" className={styles.label}>Username</label>
                  <input
                    id="username"
                    ref={usernameRef}
                    className={styles.input}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-invalid={errors.username ? true : false}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                  {errors.username && (
                    <div id="username-error" className={styles.error} role="alert">{errors.username}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    id="email"
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

                <div className={styles.formGroup}>
                  <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
                  <input
                    id="confirm"
                    className={styles.input}
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={errors.confirm ? true : false}
                    aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                  />
                  {errors.confirm && (
                    <div id="confirm-error" className={styles.error} role="alert">{errors.confirm}</div>
                  )}
                </div>

                <button className={styles.btnPrimary} type="submit" disabled={loading}>
                  {loading ? 'Creating…' : 'Create account'}
                </button>

                <div className={styles.formFooter}>
                  <Link className={styles.link} to="/auth/forgot">Forgot password?</Link>
                  <Link className={styles.link} to="/auth/login">Already have an account?</Link>
                </div>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Signup
