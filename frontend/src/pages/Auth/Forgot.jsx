import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeSimple } from '@phosphor-icons/react'
import { apiJson } from '../../utils/api'
import styles from './Forgot.module.css'

const Forgot = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!email) { setError('Please enter your email'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return false }
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    
    try {
      await apiJson('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    }
  }

  return (
    <section className={styles.authSection} aria-labelledby="forgot-heading">
      <div className={styles.authContainer}>
        <div className={styles.leftCol}>
          <Link to="/" className={styles.brandSmall}>Serise</Link>
          <div className={styles.trio} aria-hidden>
            <div className={styles.trioLine}>Don't</div>
            <div className={styles.trioLineAccent}>worry.</div>
            <div className={styles.trioLine}>We've got you.</div>
          </div>
          <div className={styles.copy}>© 2025 Serise Inc.</div>
        </div>

        <aside className={styles.rightCol}>
          <div className={styles.cardWrap}>
            <div className={styles.loginCard}>
              {submitted ? (
                <div className={styles.successState}>
                  <div className={styles.successIcon} aria-hidden>
                    <EnvelopeSimple size={48} weight="duotone" />
                  </div>
                  <h1 id="forgot-heading" className={styles.loginTitle}>Check your inbox</h1>
                  <p className={styles.successDesc}>
                    If <strong>{email}</strong> is registered with Serise, you'll receive a password reset link shortly.
                  </p>
                  <p className={styles.successHint}>
                    Didn't get it? Check your spam folder, or{' '}
                    <button
                      type="button"
                      className={styles.retryLink}
                      onClick={() => { setSubmitted(false) }}
                    >
                      try again
                    </button>.
                  </p>
                  <Link to="/auth/login" className={styles.btnPrimary}>
                    Back to login
                  </Link>
                </div>
              ) : (
                <>
                  <h1 id="forgot-heading" className={styles.loginTitle}>Forgot password?</h1>
                  <p className={styles.subtitle}>
                    Enter your email and we'll send you a link to reset your password.
                  </p>

                  <form className={styles.form} onSubmit={onSubmit} noValidate>
                    {error && <div className={styles.error} role="alert">{error}</div>}
                    <div className={styles.formGroup}>
                      <label htmlFor="forgot-email" className={styles.label}>Email</label>
                      <input
                        id="forgot-email"
                        className={styles.input}
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError('') }}
                        placeholder="your@email.com"
                        autoFocus
                      />
                    </div>

                    <button className={styles.btnPrimary} type="submit">
                      Send reset link
                    </button>

                    <div className={styles.formFooter}>
                      <Link className={styles.link} to="/auth/login">← Back to login</Link>
                      <Link className={styles.link} to="/auth/signup">Create account</Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Forgot
