import { Shelf } from './Shelf.js';

/**
 * Cabinet - сигаретный шкаф
 * @typedef {Object} Cabinet
 * @property {number} id - ID шкафа
 * @property {Array<Shelf>} shelves - Полки в шкафу
 */

export class Cabinet {
  constructor(id, shelves = []) {
    this.id = id;
    this.shelves = shelves;
  }

  static fromJSON(json) {
    return new Cabinet(
      json.id,
      (json.shelves || []).map(shelf => Shelf.fromJSON(shelf))
    );
  }

  toJSON() {
    return {
      id: this.id,
      shelves: this.shelves.map(shelf => shelf.toJSON())
    };
  }
}

