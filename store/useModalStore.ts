import { create } from 'zustand';

type ModalType = 'createGroup' | 'imagePreview' | 'userProfile' | 'confirm' | null;

interface ModalStore {
  type: ModalType;
  data: Record<string, unknown>;
  open: (type: ModalType, data?: Record<string, unknown>) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  open: (type, data = {}) => set({ type, data }),
  close: () => set({ type: null, data: {} }),
}));
