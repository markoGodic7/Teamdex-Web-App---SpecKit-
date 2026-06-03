import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'teamdex.theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'high-contrast'>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'high-contrast' ? 'high-contrast' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    if (theme === 'high-contrast') document.documentElement.classList.add('hc');
    else document.documentElement.classList.remove('hc');
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <button
        className={`px-2 py-1 rounded border ${theme === 'light' ? 'bg-slate-100' : ''} focus-ring`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        Light
      </button>
      <button
        className={`px-2 py-1 rounded border ${theme === 'high-contrast' ? 'bg-yellow-300 text-black' : ''} focus-ring`}
        onClick={() => setTheme('high-contrast')}
        aria-pressed={theme === 'high-contrast'}
      >
        High Contrast
      </button>
    </div>
  );
}
