/**
 * Discrepancy - несоответствие размещения товара планограмме
 * @typedef {Object} Discrepancy
 * @property {number} expected_sku_id - Ожидаемый ID СКЮ
 * @property {Array<number>} actual_sku_ids - Фактические ID СКЮ
 */

export class Discrepancy {
    constructor(expected_sku_id, actual_sku_ids = []) {
        this.expected_sku_id = expected_sku_id;
        this.actual_sku_ids = actual_sku_ids;
    }

    static fromJSON(json) {
        return new Discrepancy(
            json.expected_sku_id,
            json.actual_sku_ids || []
        );
    }

    toJSON() {
        return {
            expected_sku_id: this.expected_sku_id,
            actual_sku_ids: this.actual_sku_ids
        };
    }
}

