import { Planogram } from '../models/Planogram.js';

// Временное хранилище для демонстрации (в реальном приложении будет API)
let planograms = [
  new Planogram(1, 3, new Date(), {
    0: 1,
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 2,
    6: 1,
    7: 1,
    8: 1,
    9: 2,
    10: 2,
    11: 2,
  })
];

let nextId = 2;

export const planogramService = {
  /**
   * Получить все планограммы
   * @returns {Promise<Planogram[]>}
   */
  async getAll() {
    // Имитация API запроса
    return Promise.resolve([...planograms]);
  },

  /**
   * Получить планограмму по ID
   * @param {number} id
   * @returns {Promise<Planogram|null>}
   */
  async getById(id) {
    const planogram = planograms.find(p => p.id === parseInt(id));
    return Promise.resolve(planogram || null);
  },

  /**
   * Создать новую планограмму
   * @param {Planogram} planogram
   * @returns {Promise<Planogram>}
   */
  async create(planogram) {
    const newPlanogram = new Planogram(
      nextId++,
      planogram.cabinet_id,
      planogram.timestamp,
      { ...planogram.mapping }
    );
    planograms.push(newPlanogram);
    return Promise.resolve(newPlanogram);
  },

  /**
   * Обновить планограмму
   * @param {number} id
   * @param {Planogram} planogram
   * @returns {Promise<Planogram|null>}
   */
  async update(id, planogram) {
    const index = planograms.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return Promise.resolve(null);
    }
    const updated = new Planogram(
      parseInt(id),
      planogram.cabinet_id,
      planogram.timestamp,
      { ...planogram.mapping }
    );
    planograms[index] = updated;
    return Promise.resolve(updated);
  },

  /**
   * Удалить планограмму
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const index = planograms.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return Promise.resolve(false);
    }
    planograms.splice(index, 1);
    return Promise.resolve(true);
  }
};

