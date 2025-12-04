import { Cabinet } from '../models/Cabinet.js';
import { Shelf } from '../models/Shelf.js';
import { Dispenser } from '../models/Dispenser.js';

// Временное хранилище для демонстрации
const cabinets = [
  new Cabinet(3, [
    new Shelf(5, [
      new Dispenser(0, 66, 0),
      new Dispenser(1, 66, 66),
      new Dispenser(2, 66, 132),
      new Dispenser(3, 66, 198),
      new Dispenser(4, 66, 264),
      new Dispenser(5, 66, 330),
      new Dispenser(6, 66, 396),
      new Dispenser(7, 66, 462),
      new Dispenser(8, 66, 528),
      new Dispenser(9, 66, 594),
      new Dispenser(10, 66, 660),
      new Dispenser(11, 66, 726),
    ])
  ])
];

export const cabinetService = {
  /**
   * Получить все шкафы
   * @returns {Promise<Cabinet[]>}
   */
  async getAll() {
    return Promise.resolve([...cabinets]);
  },

  /**
   * Получить шкаф по ID
   * @param {number} id
   * @returns {Promise<Cabinet|null>}
   */
  async getById(id) {
    const cabinet = cabinets.find(c => c.id === parseInt(id));
    return Promise.resolve(cabinet || null);
  }
};

