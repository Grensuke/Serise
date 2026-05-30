import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, logout as authLogout } from '../../utils/auth'
import styles from './navBar.module.css'

const NavBar = () => {
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(() => isAuthenticated())
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setAuthed(isAuthenticated())
    window.addEventListener('auth-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = () => setOpen((s) => !s)

  const handleLogout = () => {
    authLogout()
    setOpen(false)
    setAuthed(false)
    navigate('/')
  }

  const navLinks = authed
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/vault', label: 'Memory Vault' },
        { to: '/energy', label: 'Energy Tracker' },
        { to: '/overthinking', label: 'Anti-Overthinking' },
        { to: '/simulate', label: 'Simulator' },
        { to: '/scripts', label: 'Scripts' },
        { to: '/goals', label: 'Goals' },
        { to: '/profile', label: 'Profile' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/auth/login', label: 'Login' },
        { to: '/auth/signup', label: 'Sign up' },
      ]

  return (
    <header className={`${styles.header} ${open ? styles.menuActive : ''}`}>
      <div className={styles.container}>
        <div className={styles.brandWrap}>
          <Link to={authed ? '/dashboard' : '/'} className={`${styles.logo} fleur-de-leah-regular`}>
            Serise
          </Link>
        </div>

        <div className={styles.actions}>
          {authed && (
            <button type="button" className={styles.logoutDesktop} onClick={handleLogout}>
              Logout
            </button>
          )}
          <button
            className={`${styles.hamburger} ${open ? styles.open : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        className={`${styles.mobileMenu} ${open ? styles.open : ''}`}
        aria-hidden={!open}
        role="menu"
      >
        <ul className={styles.menuList}>
          {navLinks.map(({ to, label }) => (
            <li key={to} className={styles.menuItem} role="none">
              <Link role="menuitem" to={to} onClick={() => setOpen(false)}>
                {label}
              </Link>
            </li>
          ))}
          {authed && (
            <li className={styles.menuItem} role="none">
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default NavBar
