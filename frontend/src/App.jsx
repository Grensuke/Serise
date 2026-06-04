import React from 'react'
import './App.css'
import AppRouter from './router/AppRouter'

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Global cursor-glow: drives --glow-x/--glow-y on every .ui-card and .glow-card
  React.useEffect(() => {
    const SELECTOR = '.ui-card, .glow-card, [data-glow]';

    const onMove = (e) => {
      const card = e.target.closest(SELECTOR);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    };

    const onLeave = (e) => {
      const card = e.target.closest?.(SELECTOR);
      if (!card) return;
      card.style.setProperty('--glow-x', '-999px');
      card.style.setProperty('--glow-y', '-999px');
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave, true);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave, true);
    };
  }, []);

  return <AppRouter />
}

export default App
