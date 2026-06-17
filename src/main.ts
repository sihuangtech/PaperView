import { state } from './state';
import { loadSettings } from './store';
import { openFileDialog, loadFromCliArgs, loadPdfFromPath } from './pdf-loader';
import { goToNextPage, goToPrevPage } from './navigation';
import { dropZone, btnCover, btnClose, showPageInfo, renderCurrentPages, toggleCoverMode, closePdf } from './ui';
import { clearPageCache } from './renderer';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { loadTheme, setTheme, saveTheme, initSystemThemeListener, Theme, updateThemeMenuState } from './theme';

const btnTheme = document.getElementById('btn-theme')!;
const themeMenu = document.getElementById('theme-menu')!;

function initEventListeners() {
  dropZone.addEventListener('click', openFileDialog);

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });

  getCurrentWindow().onDragDropEvent(async ({ payload }) => {
    if (payload.type === 'enter') {
      dropZone.classList.add('dragover');
      return;
    }

    if (payload.type === 'leave') {
      dropZone.classList.remove('dragover');
      return;
    }

    if (payload.type === 'drop') {
      dropZone.classList.remove('dragover');
      const pdfPath = payload.paths.find((path) => path.toLowerCase().endsWith('.pdf'));
      if (pdfPath) {
        await loadPdfFromPath(pdfPath);
      }
    }
  });

  document.addEventListener('contextmenu', (e) => {
    if (state.pdf) {
      e.preventDefault();
      goToNextPage();
    }
  });

  document.addEventListener('click', (e) => {
    if (!state.pdf) return;
    const target = e.target as HTMLElement;
    if (target.closest('#controls') || target.closest('.theme-menu')) return;

    const x = e.clientX;
    const halfWidth = window.innerWidth / 2;
    if (x > halfWidth) {
      goToNextPage();
    } else {
      goToPrevPage();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      getCurrentWindow().setFullscreen(false).catch((error) => {
        console.error('Failed to exit fullscreen:', error);
      });
      return;
    }

    if (!state.pdf) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        goToNextPage();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        goToPrevPage();
        break;
    }
  });

  document.addEventListener('wheel', (e) => {
    if (!state.pdf) return;
    if (e.deltaY > 0) {
      goToNextPage();
    } else {
      goToPrevPage();
    }
  }, { passive: true });

  btnCover.addEventListener('click', toggleCoverMode);
  btnClose.addEventListener('click', closePdf);

  btnTheme.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('hidden');
  });

  themeMenu.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const theme = target.dataset.theme as Theme | undefined;
    if (theme) {
      setTheme(theme);
      await saveTheme(theme);
      themeMenu.classList.add('hidden');
      updateThemeMenuState();
    }
  });

  document.addEventListener('click', (e) => {
    if (!themeMenu.classList.contains('hidden')) {
      const target = e.target as HTMLElement;
      if (!target.closest('#btn-theme') && !target.closest('.theme-menu')) {
        themeMenu.classList.add('hidden');
      }
    }
  });

  document.addEventListener('mousemove', showPageInfo);

  window.addEventListener('resize', () => {
    if (state.pdf) {
      clearPageCache();
      renderCurrentPages(false);
    }
  });
}

async function init() {
  await loadSettings();
  btnCover.classList.toggle('active', state.coverMode);
  await loadTheme();
  updateThemeMenuState();
  initSystemThemeListener();
  initEventListeners();
  loadFromCliArgs();
}

init();
