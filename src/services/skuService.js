import { API_CONFIG } from '../config/api.js';

// Базовый URL API
const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * SKU Service - работа с API SKU (товаров)
 * 
 * Endpoints:
 * - GET /sku/ - получить все SKU
 */
export const skuService = {
  /**
   * Получить все SKU
   * @returns {Promise<Array>} Массив SKU
   */
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/sku/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Преобразуем данные, если нужно
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Ошибка при загрузке SKU:', error);
      throw error;
    }
  }
};

