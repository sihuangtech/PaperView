import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import * as pdfjsLib from 'pdfjs-dist';
import { state } from './state';
import { dropZone, viewer, pageTotal, renderCurrentPages } from './ui';

export async function loadPdf(data: Uint8Array) {
  state.pdf = await pdfjsLib.getDocument({ data }).promise;
  state.totalPages = state.pdf.numPages;
  state.currentPage = 1;
  state.pageCache.clear();

  pageTotal.textContent = String(state.totalPages);
  dropZone.classList.add('hidden');
  viewer.classList.remove('hidden');
  await renderCurrentPages(false);
}

export async function openFileDialog() {
  const file = await open({
    multiple: false,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (file) {
    const data = await readFile(file);
    await loadPdf(new Uint8Array(data));
  }
}

export async function loadFromCliArgs() {
  try {
    const args = await invoke<string[]>('get_cli_args');
    const pdfArg = args.find((arg) => arg.toLowerCase().endsWith('.pdf'));
    if (pdfArg) {
      const data = await readFile(pdfArg);
      await loadPdf(new Uint8Array(data));
    }
  } catch (e) {
    console.error('Failed to load PDF from args:', e);
  }
}
