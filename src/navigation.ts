import { state, getPagePairs, getCurrentPairIndex } from './state';
import { renderCurrentPages } from './ui';

export function goToNextPage() {
  if (state.transitioning) return;
  const pairs = getPagePairs();
  const pairIndex = getCurrentPairIndex();
  if (pairIndex < pairs.length - 1) {
    const nextPair = pairs[pairIndex + 1];
    state.currentPage = nextPair[0];
    renderCurrentPages(true);
  } else {
    flashBoundary();
  }
}

export function goToPrevPage() {
  if (state.transitioning) return;
  const pairs = getPagePairs();
  const pairIndex = getCurrentPairIndex();
  if (pairIndex > 0) {
    const prevPair = pairs[pairIndex - 1];
    state.currentPage = prevPair[0];
    renderCurrentPages(true);
  } else {
    flashBoundary();
  }
}

function flashBoundary() {
  const pageInfo = document.getElementById('page-info')!;
  pageInfo.style.background = 'var(--boundary-flash)';
  setTimeout(() => {
    pageInfo.style.background = '';
  }, 250);
}
