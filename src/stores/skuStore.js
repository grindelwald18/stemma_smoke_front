import { create } from 'zustand';
import { skuService } from '../services/skuService.js';

export const useSkuStore = create((set, get) => ({
  skus: [],
  loading: false,
  error: null,

  fetchSkus: async () => {
    const currentSkus = get().skus;
    if (currentSkus.length > 0) {
      return currentSkus;
    }

    set({ loading: true, error: null });
    try {
      const data = await skuService.getAll();
      set({
        skus: data,
        loading: false
      });
      return data;
    } catch (error) {
      const errorMessage = 'Ошибка при загрузке SKU';
      set({
        error: errorMessage,
        loading: false
      });
      console.error(error);
      throw error;
    }
  },

  reset: () => {
    set({
      skus: [],
      loading: false,
      error: null
    });
  }
}));

