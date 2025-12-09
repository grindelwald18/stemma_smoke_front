import { create } from 'zustand';
import { cabinetService } from '../services/cabinetService.js';

export const useCabinetStore = create((set, get) => ({
    cabinets: [],
    currentCabinet: null,
    loading: false,
    error: null,

    fetchCabinets: async (force = false) => {
        const currentCabinets = get().cabinets;
        // Если не принудительная загрузка и уже есть данные, возвращаем кеш
        if (!force && currentCabinets.length > 0) {
            return currentCabinets;
        }

        set({ loading: true, error: null });
        try {
            const data = await cabinetService.getAll();
            set({
                cabinets: data,
                loading: false
            });
            return data;
        } catch (error) {
            const errorMessage = 'Ошибка при загрузке шкафов';
            set({
                error: errorMessage,
                loading: false
            });
            console.error(error);
            throw error;
        }
    },

    fetchCabinetById: async (id) => {
        const cachedCabinet = get().cabinets.find(c => c.id === parseInt(id));
        if (cachedCabinet) {
            set({ currentCabinet: cachedCabinet });
            return cachedCabinet;
        }

        set({ loading: true, error: null });
        try {
            const cabinet = await cabinetService.getById(id);
            if (!cabinet) {
                const errorMessage = 'Шкаф не найден';
                set({ error: errorMessage, loading: false });
                return null;
            }

            const currentCabinets = get().cabinets;
            const existsInCache = currentCabinets.some(c => c.id === cabinet.id);
            if (!existsInCache) {
                set({ cabinets: [...currentCabinets, cabinet] });
            }

            set({
                currentCabinet: cabinet,
                loading: false
            });
            return cabinet;
        } catch (error) {
            const errorMessage = 'Ошибка при загрузке шкафа';
            set({
                error: errorMessage,
                loading: false
            });
            console.error(error);
            throw error;
        }
    },

    setCurrentCabinet: (cabinet) => {
        set({ currentCabinet: cabinet });
    },

    clearCurrentCabinet: () => {
        set({ currentCabinet: null });
    },

    reset: () => {
        set({
            cabinets: [],
            currentCabinet: null,
            loading: false,
            error: null
        });
    }
}));

