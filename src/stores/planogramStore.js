import { create } from 'zustand';
import { planogramService } from '../services/planogramService.js';
import { message } from 'antd';


export const usePlanogramStore = create((set, get) => ({
    planograms: [],
    currentPlanogram: null,
    loading: false,
    error: null,

    fetchPlanograms: async () => {
        set({ loading: true, error: null });
        try {
            const data = await planogramService.getAll();
            set({
                planograms: data,
                loading: false
            });
            return data;
        } catch (error) {
            const errorMessage = 'Ошибка при загрузке планограмм';
            set({
                error: errorMessage,
                loading: false
            });
            message.error(errorMessage);
            console.error(error);
            throw error;
        }
    },


    fetchPlanogramById: async (id) => {
        set({ loading: true, error: null });
        try {
            const planogram = await planogramService.getById(id);
            if (!planogram) {
                const errorMessage = 'Планограмма не найдена';
                set({ error: errorMessage, loading: false });
                message.error(errorMessage);
                return null;
            }

            set({
                currentPlanogram: planogram,
                loading: false
            });
            return planogram;
        } catch (error) {
            const errorMessage = 'Ошибка при загрузке планограммы';
            set({
                error: errorMessage,
                loading: false
            });
            message.error(errorMessage);
            console.error(error);
            throw error;
        }
    },

    createPlanogram: async (planogramData, skus = []) => {
        set({ loading: true, error: null });
        try {
            const newPlanogram = await planogramService.create(planogramData, skus);

            const currentPlanograms = get().planograms;
            set({
                planograms: [...currentPlanograms, newPlanogram],
                loading: false
            });

            message.success('Планограмма успешно создана');
            return newPlanogram;
        } catch (error) {
            const errorMessage = 'Ошибка при создании планограммы';
            set({
                error: errorMessage,
                loading: false
            });
            message.error(errorMessage);
            console.error(error);
            throw error;
        }
    },

    updatePlanogram: async (id, planogramData, skus = []) => {
        set({ loading: true, error: null });
        try {
            const updatedPlanogram = await planogramService.update(id, planogramData, skus);

            if (updatedPlanogram === null) {
                const currentPlanogram = get().currentPlanogram;
                const updatedCurrentPlanogram = currentPlanogram && currentPlanogram.id === parseInt(id)
                    ? { ...currentPlanogram, ...planogramData }
                    : null;

                set({
                    currentPlanogram: updatedCurrentPlanogram,
                    loading: false
                });

                message.success('Планограмма успешно обновлена');
                return null;
            }

            const currentPlanograms = get().planograms;
            const updatedPlanograms = currentPlanograms.map(p =>
                p.id === parseInt(id) ? updatedPlanogram : p
            );

            set({
                planograms: updatedPlanograms,
                currentPlanogram: updatedPlanogram,
                loading: false
            });

            message.success('Планограмма успешно обновлена');
            return updatedPlanogram;
        } catch (error) {
            const errorMessage = error.message || 'Ошибка при обновлении планограммы';
            set({
                error: errorMessage,
                loading: false
            });
            message.error(errorMessage);
            console.error('Ошибка при обновлении планограммы:', error);
            throw error;
        }
    },

    deletePlanogram: async (id) => {
        set({ loading: true, error: null });
        try {
            const success = await planogramService.delete(id);

            if (!success) {
                const errorMessage = 'Не удалось удалить планограмму';
                set({ error: errorMessage, loading: false });
                message.error(errorMessage);
                return false;
            }

            const currentPlanograms = get().planograms;
            const filteredPlanograms = currentPlanograms.filter(p => p.id !== parseInt(id));

            const currentPlanogram = get().currentPlanogram;
            const updatedCurrentPlanogram =
                currentPlanogram && currentPlanogram.id === parseInt(id)
                    ? null
                    : currentPlanogram;

            set({
                planograms: filteredPlanograms,
                currentPlanogram: updatedCurrentPlanogram,
                loading: false
            });

            message.success('Планограмма успешно удалена');
            return true;
        } catch (error) {
            const errorMessage = 'Ошибка при удалении планограммы';
            set({
                error: errorMessage,
                loading: false
            });
            message.error(errorMessage);
            console.error(error);
            throw error;
        }
    },

    setCurrentPlanogram: (planogram) => {
        set({ currentPlanogram: planogram });
    },

    clearCurrentPlanogram: () => {
        set({ currentPlanogram: null });
    },

    reset: () => {
        set({
            planograms: [],
            currentPlanogram: null,
            loading: false,
            error: null
        });
    }
}));

