/**
 * Dispenser (пушер) - ряд на полке
 * @typedef {Object} Dispenser
 * @property {number} id - ID пушера
 * @property {number} width - Ширина пушера
 * @property {number} x_offset - Смещение по X
 */

export class Dispenser {
  constructor(id, width = 0, x_offset = 0) {
    this.id = id;
    this.width = width;
    this.x_offset = x_offset;
  }

  static fromJSON(json) {
    return new Dispenser(
      json.id,
      json.width,
      json.x_offset
    );
  }

  toJSON() {
    return {
      id: this.id,
      width: this.width,
      x_offset: this.x_offset
    };
  }
}

