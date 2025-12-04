import { Discrepancy } from './Discrepancy.js';

/**
 * PlanogramMatchingResult - отчет по сверке с планограммой
 * @typedef {Object} PlanogramMatchingResult
 * @property {number} cabinet_id - ID шкафа по которому проверяли
 * @property {number} planogram_id - ID планограммы
 * @property {Object<number, Discrepancy>} discrepancies - Словарь несоответствий (dispenser_id -> Discrepancy)
 */

export class PlanogramMatchingResult {
  constructor(cabinet_id, planogram_id, discrepancies = {}) {
    this.cabinet_id = cabinet_id;
    this.planogram_id = planogram_id;
    this.discrepancies = discrepancies; // dispenser_id -> Discrepancy
  }

  static fromJSON(json) {
    const discrepancies = {};
    if (json.discrepancies) {
      Object.keys(json.discrepancies).forEach(key => {
        discrepancies[parseInt(key)] = Discrepancy.fromJSON(json.discrepancies[key]);
      });
    }
    return new PlanogramMatchingResult(
      json.cabinet_id,
      json.planogram_id,
      discrepancies
    );
  }

  toJSON() {
    const discrepancies = {};
    Object.keys(this.discrepancies).forEach(key => {
      discrepancies[key] = this.discrepancies[key].toJSON();
    });
    return {
      cabinet_id: this.cabinet_id,
      planogram_id: this.planogram_id,
      discrepancies
    };
  }
}

