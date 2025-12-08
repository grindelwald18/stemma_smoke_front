import { API_CONFIG } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

const transformPlanogramFromAPI = (apiPlanogram) => {
  if (!apiPlanogram) {
    return null;
  }

  let mapping = {};
  if (apiPlanogram.mapping) {
    Object.keys(apiPlanogram.mapping).forEach(key => {
      const value = apiPlanogram.mapping[key];
      if (value && typeof value === 'object' && 'id' in value) {
        mapping[key] = {
          id: value.id,
          name: value.name || null,
          image: value.image || null
        };
      } else {
        mapping[key] = value;
      }
    });
  }

  return {
    id: apiPlanogram.id,
    cabinet_id: apiPlanogram.cabinet?.id || null,
    cabinet: apiPlanogram.cabinet,
    timestamp: apiPlanogram.timestamp,
    mapping: mapping
  };
};

const transformPlanogramToAPI = (planogram, includeId = true, skus = []) => {

  const skuMap = new Map();
  if (Array.isArray(skus)) {
    skus.forEach(sku => {
      if (sku && sku.id !== undefined) {
        skuMap.set(sku.id, {
          name: sku.name || '',
          image: sku.image || ''
        });
      }
    });
  }

  const mapping = Object.create(null);
  if (planogram.mapping) {
    Object.keys(planogram.mapping).forEach(key => {
      const stringKey = String(key);
      const value = planogram.mapping[key];

      if (value && typeof value === 'object' && 'id' in value) {
        mapping[stringKey] = {
          id: value.id || 0,
          name: value.name || '',
          image: value.image || ''
        };
      } else {
        const skuId = value !== undefined && value !== null ? parseInt(value) : 0;
        const skuData = skuMap.get(skuId);
        mapping[stringKey] = {
          id: skuId,
          name: skuData ? skuData.name : '',
          image: skuData ? skuData.image : ''
        };
      }
    });
  }

  const apiData = {
    timestamp: planogram.timestamp instanceof Date
      ? planogram.timestamp.toISOString()
      : planogram.timestamp,
    mapping: mapping
  };

  if (planogram.cabinet) {
    apiData.cabinet = planogram.cabinet;
  } else if (planogram.cabinet_id) {
    console.warn('Warning: planogram.cabinet is missing, only cabinet_id provided');
  }

  if (includeId && planogram.id && planogram.id !== 0) {
    apiData.id = planogram.id;
  }

  return apiData;
};

export const planogramService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/planogram/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return Array.isArray(data)
        ? data.map(transformPlanogramFromAPI)
        : [];
    } catch (error) {
      console.error('Ошибка при загрузке планограмм:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/planogram/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return transformPlanogramFromAPI(data);
    } catch (error) {
      console.error('Ошибка при загрузке планограммы:', error);
      throw error;
    }
  },

  async create(planogram, skus = []) {
    try {
      const apiData = transformPlanogramToAPI(planogram, false, skus);

      const response = await fetch(`${API_BASE_URL}/planogram/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return transformPlanogramFromAPI(data);
    } catch (error) {
      console.error('Ошибка при создании планограммы:', error);
      throw error;
    }
  },

  async update(id, planogram, skus = []) {
    try {
      const apiData = transformPlanogramToAPI(planogram, true, skus);

      const response = await fetch(`${API_BASE_URL}/planogram/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        let errorData = {};
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
          } catch {
            console.error('Response is not JSON');
          }
        } catch (e) {
          console.error('Ошибка при чтении ответа:', e);
        }
        const errorMessage = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return transformPlanogramFromAPI(data);
    } catch (error) {
      console.error('Ошибка при обновлении планограммы:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/planogram/${id}/`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Ошибка при удалении планограммы:', error);
      throw error;
    }
  }
};

