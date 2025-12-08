import { Typography } from 'antd';
import './style.css';

const { Text } = Typography;

const ShowcaseGrid = ({
    rowCount = 6,
    columnCount = 8,
    mapping = {},
    discrepancies = {},
    onDispenserClick,
    dispensers = null
}) => {
    const createGridMatrix = () => {
        const matrix = [];

        if (dispensers && Array.isArray(dispensers)) {
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

            for (let row = 0; row < rowCount; row++) {
                matrix[row] = [];
                for (let col = 0; col < columnCount; col++) {
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


    const getSkuData = (dispenserId) => {
        if (dispenserId === null || dispenserId === undefined) {
            return null;
        }

        const stringKey = String(dispenserId);
        let value = null;

        if (Object.prototype.hasOwnProperty.call(mapping, stringKey)) {
            value = mapping[stringKey];
        } else if (Object.prototype.hasOwnProperty.call(mapping, dispenserId)) {
            value = mapping[dispenserId];
        }

        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'object' && 'id' in value) {
            return value;
        }

        const numericId = typeof value === 'number' ? value : parseInt(value);
        return {
            id: numericId,
            name: null,
            image: null
        };
    };

    const isEmptySku = (skuData) => {
        if (!skuData) return true;
        if (skuData.id === null || skuData.id === undefined) return true;
        return false;
    };

    const shouldShowPlaceholder = (skuData) => {
        if (!skuData) return true;
        if (!skuData.image || skuData.image === null) {
            return true;
        }
        if (typeof skuData.image === 'string') {
            const trimmed = skuData.image.trim();
            if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
                return true;
            }
            return false;
        }
        return true;
    };

    const getCellStatus = (dispenserId) => {
        if (dispenserId === null) return 'empty';

        const skuData = getSkuData(dispenserId);
        const hasDiscrepancy = discrepancies[dispenserId] || discrepancies[String(dispenserId)];

        if (hasDiscrepancy) {
            return 'error';
        }
        if (skuData && skuData.id === 0 && skuData.name === "Пусто") {
            return 'default';
        }
        if (skuData && !isEmptySku(skuData) && skuData.id !== 0) {
            return 'success';
        }
        return 'default';
    };

    const getCellText = (dispenserId) => {
        if (dispenserId === null) return '';

        const skuData = getSkuData(dispenserId);
        if (!skuData) return 'SMOKING KILLS';

        if (skuData.id === 0 && skuData.name === "Пусто") {
            return String(skuData.name || 'Пусто');
        }
        if (skuData.id !== 0 && skuData.id !== null && skuData.id !== undefined) {
            return `SKU: ${skuData.id}`;
        }
        return 'SMOKING KILLS';
    };

    const getImageSrc = (skuData) => {
        if (!skuData) {
            return '/image.png';
        }

        if (skuData.image && typeof skuData.image === 'string') {
            const trimmedImage = skuData.image.trim();

            if (trimmedImage === '' || trimmedImage === 'null' || trimmedImage === 'undefined') {
                return '/image.png';
            }

            if (trimmedImage.startsWith('data:')) {
                return trimmedImage;
            }

            const cleanBase64 = trimmedImage.replace(/\s/g, '');

            if (cleanBase64 === '') {
                return '/image.png';
            }

            let mimeType = 'image/jpeg';
            if (cleanBase64.startsWith('/9j/') || cleanBase64.startsWith('i/9j/')) {
                mimeType = 'image/jpeg';
            } else if (cleanBase64.startsWith('iVBORw0KGgo')) {
                mimeType = 'image/png';
            } else if (cleanBase64.startsWith('R0lGODlh') || cleanBase64.startsWith('R0lGODdh')) {
                mimeType = 'image/gif';
            }

            const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
            return dataUrl;
        }

        return '/image.png';
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
                        const skuData = getSkuData(dispenserId);
                        const isEmpty = dispenserId === null || isEmptySku(skuData);
                        const status = getCellStatus(dispenserId);
                        const cellText = getCellText(dispenserId);
                        const imageSrc = getImageSrc(skuData);

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
                                        {/* <div className="dispenser-icon">
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
                                        </div> */}

                                        {/* Изображение пачки */}
                                        <div className={`cigarette-pack ${isEmpty ? 'empty' : ''}`}>
                                            <img
                                                src={imageSrc}
                                                alt={skuData?.name ? String(skuData.name) : "Cigarette pack"}
                                                className="cigarette-pack-image"
                                                onError={(e) => { e.target.src = '/image.png'; }}
                                            />
                                        </div>

                                        {/* Текст */}
                                        <div className="showcase-item-text">
                                            <Text
                                                type={isEmpty ? "secondary" : "default"}
                                                style={{ fontSize: '8px', textAlign: 'center', lineHeight: '1.2' }}
                                            >
                                                {typeof cellText === 'string' ? cellText : String(cellText || '')}
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
