import React from 'react';
import { Typography } from 'antd';
import './style.css';

const { Text } = Typography;

/**
 * Компонент-сетка для витрины с товарами (планограмма).
 * Отображает сетку пушеров с визуализацией товаров и статусов.
 *
 * @param {object} props - Свойства компонента.
 * @param {number} props.rowCount - Количество строк в витрине (по умолчанию 6).
 * @param {number} props.columnCount - Количество столбцов в витрине (по умолчанию 8).
 * @param {object} props.mapping - Маппинг пушеров в СКЮ (dispenser_id -> sku_id).
 * @param {object} props.discrepancies - Объект несоответствий (dispenser_id -> true).
 * @param {function} props.onDispenserClick - Callback при клике на пушер (опционально).
 * @param {Array} props.dispensers - Массив пушеров с их позициями (опционально).
 * @returns {JSX.Element} - Элемент JSX, представляющий витрину.
 */
const ShowcaseGrid = ({
    rowCount = 6,
    columnCount = 8,
    mapping = {},
    discrepancies = {},
    onDispenserClick,
    dispensers = null
}) => {
    // Создаем матрицу для отображения пушеров
    const createGridMatrix = () => {
        const matrix = [];

        if (dispensers && Array.isArray(dispensers)) {
            // Если передан массив пушеров, используем их реальные позиции
            // Создаем маппинг dispenser_id -> позиция (row, col)
            const dispenserMap = new Map();
            let currentRow = 0;
            let currentCol = 0;

            dispensers.forEach((dispenser) => {
                dispenserMap.set(dispenser.id, { row: currentRow, col: currentCol });
                currentCol++;
                if (currentCol >= columnCount) {
                    currentCol = 0;
                    currentRow++;
                }
            });

            // Заполняем матрицу
            for (let row = 0; row < rowCount; row++) {
                matrix[row] = [];
                for (let col = 0; col < columnCount; col++) {
                    // Находим пушер для этой позиции
                    let dispenserId = null;
                    for (const [id, pos] of dispenserMap.entries()) {
                        if (pos.row === row && pos.col === col) {
                            dispenserId = id;
                            break;
                        }
                    }
                    matrix[row][col] = dispenserId;
                }
            }
        } else {
            // Стандартная логика - последовательная нумерация
            let index = 0;
            for (let row = 0; row < rowCount; row++) {
                matrix[row] = [];
                for (let col = 0; col < columnCount; col++) {
                    matrix[row][col] = index++;
                }
            }
        }

        return matrix;
    };

    const gridMatrix = createGridMatrix();

    // Определяем статус ячейки
    const getCellStatus = (dispenserId) => {
        if (dispenserId === null) return 'empty';

        const skuId = mapping[dispenserId];
        const hasDiscrepancy = discrepancies[dispenserId];

        if (hasDiscrepancy) {
            return 'error'; // Красная граница - несоответствие
        }
        if (skuId && skuId !== 0) {
            return 'success'; // Зеленая граница - правильно заполненный
        }
        return 'default'; // Серая граница - пустой или нейтральный
    };

    // Получаем текст для отображения
    const getCellText = (dispenserId) => {
        if (dispenserId === null) return '';

        const skuId = mapping[dispenserId];
        if (skuId && skuId !== 0) {
            return `SKU: ${skuId}`;
        }
        return 'SMOKING KILLS';
    };

    return (
        <div className="showcase-container">
            <div className="showcase-header">
                <Text strong>Витрина ({rowCount}x{columnCount})</Text>
            </div>

            <div
                className="showcase-grid"
                style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
            >
                {gridMatrix.flatMap((row, rowIndex) =>
                    row.map((dispenserId, colIndex) => {
                        const isEmpty = dispenserId === null || !mapping[dispenserId] || mapping[dispenserId] === 0;
                        const status = getCellStatus(dispenserId);
                        const cellText = getCellText(dispenserId);

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}-${dispenserId || 'empty'}`}
                                className={`showcase-item showcase-item-${status}`}
                                onClick={() => dispenserId !== null && onDispenserClick && onDispenserClick(dispenserId)}
                                style={{
                                    cursor: dispenserId !== null && onDispenserClick ? 'pointer' : 'default'
                                }}
                            >
                                {dispenserId !== null ? (
                                    <div className="showcase-item-content">
                                        {/* Иконка пушера */}
                                        <div className="dispenser-icon">
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 4v16M8 16l4 4 4-4M8 4h8"
                                                    stroke="#666"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>

                                        {/* Изображение пачки */}
                                        <div className={`cigarette-pack ${isEmpty ? 'empty' : ''}`}>
                                            <img
                                                src="/image.png"
                                                alt="Cigarette pack"
                                                className="cigarette-pack-image"
                                            />
                                        </div>

                                        {/* Текст */}
                                        <div className="showcase-item-text">
                                            <Text
                                                type={isEmpty ? "secondary" : "default"}
                                                style={{ fontSize: '8px', textAlign: 'center', lineHeight: '1.2' }}
                                            >
                                                {cellText}
                                            </Text>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="showcase-item-content showcase-item-empty">
                                        {/* Пустая ячейка */}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ShowcaseGrid;
