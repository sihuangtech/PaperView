import { state } from './state';
import { loadSettings } from './store';
import { openFileDialog, loadFromCliArgs } from './pdf-loader';
import { goToNextPage, goToPrevPage } from './navigation';
import { dropZone, btnCover, showPageInfo, renderCurrentPages, toggleCoverMode } from './ui';
import { clearPageCache } from './renderer';

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

  document.addEventListener('contextmenu', (e) => {
    if (state.pdf) {
      e.preventDefault();
      goToNextPage();
    }
  });

  document.addEventListener('click', (e) => {
    if (!state.pdf) return;
    const target = e.target as HTMLElement;
    if (target.closest('#controls')) return;

    const x = e.clientX;
    const halfWidth = window.innerWidth / 2;
    if (x > halfWidth) {
      goToNextPage();
    } else {
      goToPrevPage();
    }
  });

  document.addEventListener('keydown', (e) => {
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
  initEventListeners();
  loadFromCliArgs();
}

init();
