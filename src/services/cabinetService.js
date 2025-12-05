// Моковые данные согласно структуре бэкенда
const row_width = 66;
const row_count = 12;

const cabinets = [
  {
    id: 3,
    shelf_size: {
      x: { value: row_width * row_count, unit: 'mm' },
      y: { value: 340, unit: 'mm' },
      z: { value: 170, unit: 'mm' }
    },
    shelves: [
      {
        id: 5,
        dispensers: Array.from({ length: row_count }, (_, i) => ({
          id: i,
          width: { value: row_width, unit: 'mm' },
          x_offset: { value: i * row_width, unit: 'mm' }
        })),
        cameras: [
          {
            id: 101,
            hardware: {
              fov: { value: 120, unit: 'Degree' }
            },
            position: {
              x: { value: row_width * 1.5, unit: 'mm' },
              y: { value: 130, unit: 'mm' }
            },
            rotation: {
              x: { value: 40, unit: 'Degree' },
              y: { value: 0, unit: 'Degree' }
            }
          },
          {
            id: 102,
            hardware: {
              fov: { value: 120, unit: 'Degree' }
            },
            position: {
              x: { value: row_width * 4.5, unit: 'mm' },
              y: { value: 130, unit: 'mm' }
            },
            rotation: {
              x: { value: 40, unit: 'Degree' },
              y: { value: 0, unit: 'Degree' }
            }
          },
          {
            id: 103,
            hardware: {
              fov: { value: 120, unit: 'Degree' }
            },
            position: {
              x: { value: row_width * 7.5, unit: 'mm' },
              y: { value: 130, unit: 'mm' }
            },
            rotation: {
              x: { value: 40, unit: 'Degree' },
              y: { value: 0, unit: 'Degree' }
            }
          },
          {
            id: 104,
            hardware: {
              fov: { value: 120, unit: 'Degree' }
            },
            position: {
              x: { value: row_width * 10.5, unit: 'mm' },
              y: { value: 130, unit: 'mm' }
            },
            rotation: {
              x: { value: 40, unit: 'Degree' },
              y: { value: 0, unit: 'Degree' }
            }
          }
        ]
      }
    ]
  }
];

export const cabinetService = {

  async getAll() {
    return Promise.resolve([...cabinets]);
  },

  async getById(id) {
    const cabinet = cabinets.find(c => c.id === parseInt(id));
    return Promise.resolve(cabinet ? { ...cabinet } : null);
  }
};

