import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

export interface AppState {
  pdf: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;
  coverMode: boolean;
  scale: number;
  pageCache: Map<number, HTMLCanvasElement>;
  hideTimer: number | null;
  transitioning: boolean;
}

export const state: AppState = {
  pdf: null,
  currentPage: 1,
  totalPages: 0,
  coverMode: true,
  scale: 1,
  pageCache: new Map(),
  hideTimer: null,
  transitioning: false,
};

export type PagePair = [number, number | null];

export function getPagePairs(): PagePair[] {
  const pairs: PagePair[] = [];
  if (state.coverMode) {
    pairs.push([1, null]);
    for (let i = 2; i <= state.totalPages; i += 2) {
      pairs.push([i, i + 1 <= state.totalPages ? i + 1 : null]);
    }
  } else {
    for (let i = 1; i <= state.totalPages; i += 2) {
      pairs.push([i, i + 1 <= state.totalPages ? i + 1 : null]);
    }
  }
  return pairs;
}

export function getCurrentPairIndex(): number {
  const pairs = getPagePairs();
  for (let i = 0; i < pairs.length; i++) {
    const [left, right] = pairs[i];
    if (state.currentPage === left || (right !== null && state.currentPage === right)) {
      return i;
    }
  }
  return 0;
}
