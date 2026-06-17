import { state, getPagePairs, getCurrentPairIndex } from './state';
import { renderPage, preloadNextPages } from './renderer';
import { saveCoverMode } from './store';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const dropZone = document.getElementById('drop-zone')!;
export const viewer = document.getElementById('viewer')!;
export const pagesContainer = document.getElementById('pages-container')!;
export const pageInfo = document.getElementById('page-info')!;
export const pageNum = document.getElementById('page-num')!;
export const pageTotal = document.getElementById('page-total')!;
export const btnCover = document.getElementById('btn-cover')!;
export const btnClose = document.getElementById('btn-close')!;

export function showPageInfo() {
  pageInfo.classList.remove('fade');
  if (state.hideTimer) clearTimeout(state.hideTimer);
  state.hideTimer = window.setTimeout(() => {
    pageInfo.classList.add('fade');
  }, 3000);
}

export async function renderCurrentPages(animate: boolean = true) {
  if (state.transitioning) return;
  state.transitioning = true;

  const pairs = getPagePairs();
  const pairIndex = getCurrentPairIndex();
  const [leftPage, rightPage] = pairs[pairIndex];
  const pagesInSpread = rightPage === null ? 1 : 2;

  const leftCanvas = await renderPage(leftPage, pagesInSpread);
  let rightCanvas: HTMLCanvasElement | null = null;
  if (rightPage !== null) {
    rightCanvas = await renderPage(rightPage, pagesInSpread);
  }

  pagesContainer.innerHTML = '';
  if (animate) {
    pagesContainer.classList.add('page-transition');
  }

  pagesContainer.appendChild(leftCanvas);

  if (rightCanvas) {
    const separator = document.createElement('div');
    separator.className = 'page-separator';
    pagesContainer.appendChild(separator);
    pagesContainer.appendChild(rightCanvas);
  }

  if (rightPage) {
    pageNum.textContent = `${leftPage}-${rightPage}`;
  } else {
    pageNum.textContent = String(leftPage);
  }

  showPageInfo();
  preloadNextPages(pairIndex);

  if (animate) {
    setTimeout(() => {
      pagesContainer.classList.remove('page-transition');
      state.transitioning = false;
    }, 200);
  } else {
    state.transitioning = false;
  }
}

export async function toggleCoverMode() {
  state.coverMode = !state.coverMode;
  btnCover.classList.toggle('active', state.coverMode);
  await saveCoverMode(state.coverMode);
  if (state.pdf) {
    state.currentPage = 1;
    await renderCurrentPages(false);
  }
}

export async function closePdf() {
  state.pdf = null;
  state.totalPages = 0;
  state.currentPage = 1;
  state.pageCache.clear();
  state.transitioning = false;
  pagesContainer.innerHTML = '';
  viewer.classList.add('hidden');
  dropZone.classList.remove('hidden');
  try {
    await getCurrentWindow().setFullscreen(false);
  } catch (e) {
    console.error('Failed to exit fullscreen:', e);
  }
}
