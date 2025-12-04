/**
 * Planogram - планограмма
 * @typedef {Object} Planogram
 * @property {number} id - ID планограммы
 * @property {number} cabinet_id - ID шкафа для которого действует планограмма
 * @property {Date|string} timestamp - Время валидности планограммы
 * @property {Object<number, number>} mapping - Маппинг пушеров в СКЮ (dispenser_id -> sku_id). 0 означает пусто
 */

export class Planogram {
  constructor(id, cabinet_id, timestamp, mapping = {}) {
    this.id = id;
    this.cabinet_id = cabinet_id;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
    this.mapping = mapping; // dispenser_id -> sku_id
  }

  static fromJSON(json) {
    return new Planogram(
      json.id,
      json.cabinet_id,
      json.timestamp,
      json.mapping || {}
    );
  }

  toJSON() {
    return {
      id: this.id,
      cabinet_id: this.cabinet_id,
      timestamp: this.timestamp.toISOString(),
      mapping: this.mapping
    };
  }
}

