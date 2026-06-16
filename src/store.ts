import { load } from '@tauri-apps/plugin-store';
import { state } from './state';

let store: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!store) {
    store = await load('settings.json', { autoSave: true, defaults: {} });
  }
  return store;
}

export async function loadSettings() {
  const s = await getStore();
  const savedCoverMode = await s.get<boolean>('coverMode');
  if (savedCoverMode !== undefined) {
    state.coverMode = savedCoverMode;
  }
}

export async function saveCoverMode(value: boolean) {
  const s = await getStore();
  await s.set('coverMode', value);
}
