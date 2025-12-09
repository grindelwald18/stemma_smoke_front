import { API_CONFIG } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const cabinetService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/cabinet/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Ошибка при загрузке шкафов:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cabinet/${id}/`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при загрузке шкафа:', error);
      throw error;
    }
  }
};

