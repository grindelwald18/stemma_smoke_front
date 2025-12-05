# Сервисы и структура данных

## Структура данных согласно бэкенду

### Cabinet (Шкаф)

```javascript
{
  id: number,                    // CabinetId
  shelf_size: {
    x: { value: number, unit: string },  // Size3D
    y: { value: number, unit: string },
    z: { value: number, unit: string }
  },
  shelves: [Shelf]
}
```

### Shelf (Полка)

```javascript
{
  id: number,                    // ShelfId
  dispensers: [Dispenser],
  cameras: [Camera]
}
```

### Dispenser (Пушер)

```javascript
{
  id: number,                    // DispenserId
  width: { value: number, unit: string },      // Measurement
  x_offset: { value: number, unit: string }    // Measurement
}
```

### Camera (Камера)

```javascript
{
  id: number,                    // CameraId
  hardware: {
    fov: { value: number, unit: string }       // Measurement
  },
  position: {
    x: { value: number, unit: string },         // Measurement
    y: { value: number, unit: string }
  },
  rotation: {
    x: { value: number, unit: string },         // Measurement
    y: { value: number, unit: string }
  }
}
```

### Planogram (Планограмма)

```javascript
{
  id: number,                    // PlanogramId
  cabinet_id: number,            // CabinetId
  timestamp: string,             // ISO datetime string
  mapping: {
    [dispenserId: number]: skuId: number  // DispenserId -> SkuId
  }
}
```

## Работа с Measurement

Все измерения на бэкенде представлены как объекты `Measurement` с полями `value` и `unit`.

Для удобной работы используйте функции из `utils/dataHelpers.js`:

```javascript
import {
    getMeasurementValue,
    getDispenserWidth,
} from "../utils/dataHelpers.js";

// Получить числовое значение
const width = getMeasurementValue(dispenser.width); // вернет число
const width2 = getDispenserWidth(dispenser); // то же самое

// Прямой доступ (если уверены в структуре)
const width3 = dispenser.width.value;
```

## Сервисы

### cabinetService

-   `getAll()` - получить все шкафы
-   `getById(id)` - получить шкаф по ID

### planogramService

-   `getAll()` - получить все планограммы
-   `getById(id)` - получить планограмму по ID
-   `create(planogram)` - создать новую планограмму
-   `update(id, planogram)` - обновить планограмму
-   `delete(id)` - удалить планограмму

## Моковые данные

Текущие моковые данные соответствуют структуре из `sample_data.py`:

-   Шкаф с ID 3
-   Одна полка с ID 5
-   12 пушеров (ID 0-11)
-   4 камеры (ID 101-104)
-   Планограмма с ID 2
