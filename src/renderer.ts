import { state, getPagePairs } from './state';

export async function renderPage(pageNum: number, pagesInSpread: 1 | 2): Promise<HTMLCanvasElement> {
  const dpr = window.devicePixelRatio || 1;
  const containerHeight = window.innerHeight - 32;
  const containerWidth = window.innerWidth - 32;
  const cacheKey = `${pageNum}:${pagesInSpread}:${containerWidth}:${containerHeight}:${dpr}`;

  if (state.pageCache.has(cacheKey)) {
    return state.pageCache.get(cacheKey)!;
  }

  const page = await state.pdf!.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const widthForPage = pagesInSpread === 1 ? containerWidth : containerWidth / 2 - 8;

  const scaleByHeight = containerHeight / viewport.height;
  const scaleByWidth = widthForPage / viewport.width;
  state.scale = Math.min(scaleByHeight, scaleByWidth);

  const scaledViewport = page.getViewport({ scale: state.scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(scaledViewport.width * dpr);
  canvas.height = Math.floor(scaledViewport.height * dpr);
  canvas.style.width = `${Math.floor(scaledViewport.width)}px`;
  canvas.style.height = `${Math.floor(scaledViewport.height)}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  await page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }).promise;

  state.pageCache.set(cacheKey, canvas);
  return canvas;
}

export function clearPageCache() {
  state.pageCache.clear();
}

export async function preloadNextPages(currentPairIndex: number) {
  const pairs = getPagePairs();
  for (let i = 1; i <= 2; i++) {
    const nextIndex = currentPairIndex + i;
    if (nextIndex < pairs.length) {
      const [left, right] = pairs[nextIndex];
      const pagesInSpread = right ? 2 : 1;
      renderPage(left, pagesInSpread).catch(() => {});
      if (right) renderPage(right, pagesInSpread).catch(() => {});
    }
  }
}
