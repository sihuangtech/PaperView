import { state, getPagePairs } from './state';

export async function renderPage(pageNum: number): Promise<HTMLCanvasElement> {
  if (state.pageCache.has(pageNum)) {
    return state.pageCache.get(pageNum)!;
  }

  const page = await state.pdf!.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const containerHeight = window.innerHeight - 32;
  const containerWidth = window.innerWidth - 32;

  const scaleByHeight = containerHeight / viewport.height;
  const scaleByWidth = (containerWidth / 2 - 8) / viewport.width;
  state.scale = Math.min(scaleByHeight, scaleByWidth);

  const scaledViewport = page.getViewport({ scale: state.scale });
  const canvas = document.createElement('canvas');
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  const ctx = canvas.getContext('2d')!;
  await page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }).promise;

  state.pageCache.set(pageNum, canvas);
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
      renderPage(left).catch(() => {});
      if (right) renderPage(right).catch(() => {});
    }
  }
}
