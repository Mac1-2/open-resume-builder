import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import { generateId } from '@/lib/utils';

interface UIStore {
  // Sidebar state
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal state
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  addToast: (toast: Omit<UIStore['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({isSidebarOpen: open}),
      
      activeModal: null,
      setActiveModal: (modal) => set({activeModal: modal}),
      
      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {...toast, id: generateId()},
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
      
      theme: 'system',
      setTheme: (theme) => set({theme}),
    }),
    {
      name: 'ui-store',
    }
  )
);
