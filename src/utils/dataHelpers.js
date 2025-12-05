/**
 * Вспомогательные функции для работы с данными бэкенда
 */

/**
 * Получить числовое значение из Measurement объекта
 * @param {Object|number} measurement - Measurement объект {value: number, unit: string} или число
 * @returns {number}
 */
export function getMeasurementValue(measurement) {
    if (typeof measurement === 'number') {
        return measurement;
    }
    if (measurement && typeof measurement === 'object' && 'value' in measurement) {
        return measurement.value;
    }
    return 0;
}

/**
 * Получить единицу измерения из Measurement объекта
 * @param {Object|number} measurement - Measurement объект {value: number, unit: string} или число
 * @returns {string}
 */
export function getMeasurementUnit(measurement) {
    if (typeof measurement === 'number') {
        return '';
    }
    if (measurement && typeof measurement === 'object' && 'unit' in measurement) {
        return measurement.unit;
    }
    return '';
}

/**
 * Получить ширину пушера как число
 * @param {Object} dispenser - Объект пушера
 * @returns {number}
 */
export function getDispenserWidth(dispenser) {
    return getMeasurementValue(dispenser.width);
}

/**
 * Получить смещение пушера как число
 * @param {Object} dispenser - Объект пушера
 * @returns {number}
 */
export function getDispenserXOffset(dispenser) {
    return getMeasurementValue(dispenser.x_offset);
}

/**
 * Получить все пушеры из всех полок шкафа
 * @param {Object} cabinet - Объект шкафа
 * @returns {Array}
 */
export function getAllDispensers(cabinet) {
    if (!cabinet || !cabinet.shelves) {
        return [];
    }
    return cabinet.shelves.flatMap(shelf => shelf.dispensers || []);
}

