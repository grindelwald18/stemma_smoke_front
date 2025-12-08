const row_width = 66;
const dispensers_per_shelf = 8;
const shelf_count = 6;

const cabinets = [
  {
    id: 3,
    shelf_size: {
      x: { value: row_width * dispensers_per_shelf, unit: 'mm' },
      y: { value: 340, unit: 'mm' },
      z: { value: 170, unit: 'mm' }
    },
    shelves: Array.from({ length: shelf_count }, (_, shelfIndex) => ({
      id: shelfIndex + 1,
      dispensers: Array.from({ length: dispensers_per_shelf }, (_, i) => ({
        id: shelfIndex * dispensers_per_shelf + i,
        width: { value: row_width, unit: 'mm' },
        x_offset: { value: i * row_width, unit: 'mm' }
      })),
      cameras: [
        {
          id: 101 + shelfIndex * 10,
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
          id: 102 + shelfIndex * 10,
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
        }
      ]
    }))
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

