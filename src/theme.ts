import { load } from '@tauri-apps/plugin-store';

export type Theme = 'light' | 'dark' | 'system';

let currentTheme: Theme = 'dark';
let mediaQuery: MediaQueryList | null = null;

function getSystemTheme(): 'light' | 'dark' {
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }
  return mediaQuery.matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme) {
  currentTheme = theme;
  if (theme === 'system') {
    applyTheme(getSystemTheme());
  } else {
    applyTheme(theme);
  }
  updateThemeButton();
}

export function getCurrentTheme(): Theme {
  return currentTheme;
}

function updateThemeButton() {
  const btnTheme = document.getElementById('btn-theme');
  if (!btnTheme) return;

  const labels: Record<Theme, string> = {
    light: '浅色',
    dark: '深色',
    system: '系统',
  };
  btnTheme.textContent = labels[currentTheme];
}

export async function loadTheme() {
  try {
    const store = await load('settings.json', { autoSave: true, defaults: {} });
    const saved = await store.get<Theme>('theme');
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      currentTheme = saved;
    }
  } catch {
    // ignore
  }
  setTheme(currentTheme);
}

export async function saveTheme(theme: Theme) {
  const store = await load('settings.json', { autoSave: true, defaults: {} });
  await store.set('theme', theme);
}

export function initSystemThemeListener() {
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }
  mediaQuery.addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme(getSystemTheme());
    }
  });
}
