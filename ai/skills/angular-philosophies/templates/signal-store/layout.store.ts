import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { withStorageSync } from '@ngrx-toolkit/core';
import { guardedDevtools } from './guarded-devtools';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ar';

interface LayoutState {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
}

const initialState: LayoutState = { theme: 'light', language: 'en', sidebarCollapsed: false };

export const LayoutStore = signalStore(
  { providedIn: 'root' },
  guardedDevtools('layout'),
  withState(initialState),
  // Persist only what should survive a reload. Placed right after withState.
  withStorageSync({ key: 'app-layout', select: ({ theme, language }) => ({ theme, language }) }),
  withComputed(({ language }) => ({
    isRtl: computed(() => language() === 'ar'),
    dir: computed(() => (language() === 'ar' ? 'rtl' : 'ltr')),
  })),
  withMethods(store => ({
    setTheme(theme: Theme) {
      patchState(store, { theme });
    },
    setLanguage(language: Language) {
      patchState(store, { language });
    },
    toggleSidebar() {
      patchState(store, s => ({ sidebarCollapsed: !s.sidebarCollapsed }));
    },
  })),
);
