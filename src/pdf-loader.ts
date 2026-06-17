import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { getCurrentWindow } from '@tauri-apps/api/window';
import * as pdfjsLib from 'pdfjs-dist';
import { state } from './state';
import { dropZone, viewer, pageTotal, renderCurrentPages } from './ui';

async function enterFullscreen() {
  try {
    await getCurrentWindow().setFullscreen(true);
  } catch (e) {
    console.error('Failed to enter fullscreen:', e);
  }
}

export async function loadPdf(data: Uint8Array) {
  state.pdf = await pdfjsLib.getDocument({ data }).promise;
  state.totalPages = state.pdf.numPages;
  state.currentPage = 1;
  state.pageCache.clear();

  pageTotal.textContent = String(state.totalPages);
  dropZone.classList.add('hidden');
  viewer.classList.remove('hidden');
  await enterFullscreen();
  await renderCurrentPages(false);
}

export async function loadPdfFromPath(path: string) {
  const data = await readFile(path);
  await loadPdf(new Uint8Array(data));
}

export async function openFileDialog() {
  const file = await open({
    multiple: false,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (file) {
    await loadPdfFromPath(file);
  }
}

export async function loadFromCliArgs() {
  try {
    const args = await invoke<string[]>('get_cli_args');
    const pdfArg = args.find((arg) => arg.toLowerCase().endsWith('.pdf'));
    if (pdfArg) {
      await loadPdfFromPath(pdfArg);
    }
  } catch (e) {
    console.error('Failed to load PDF from args:', e);
  }
}
