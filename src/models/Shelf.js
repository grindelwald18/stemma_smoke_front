import { Dispenser } from './Dispenser.js';

/**
 * Shelf - полка в шкафу
 * @typedef {Object} Shelf
 * @property {number} id - ID полки
 * @property {Array<Dispenser>} dispensers - Пушеры на полке
 */

export class Shelf {
  constructor(id, dispensers = []) {
    this.id = id;
    this.dispensers = dispensers;
  }

  static fromJSON(json) {
    return new Shelf(
      json.id,
      (json.dispensers || []).map(dispenser => Dispenser.fromJSON(dispenser))
    );
  }

  toJSON() {
    return {
      id: this.id,
      dispensers: this.dispensers.map(dispenser => dispenser.toJSON())
    };
  }
}

