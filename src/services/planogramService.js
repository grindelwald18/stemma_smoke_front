// Моковые данные согласно структуре бэкенда
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(now);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date(now);
nextMonth.setMonth(nextMonth.getMonth() + 1);

let planograms = [
  {
    id: 2,
    cabinet_id: 3,
    timestamp: now.toISOString(),
    mapping: {
      0: 1,
      1: 1,
      2: 1,
      3: 2,
      4: 2,
      5: 2,
      6: 1,
      7: 1,
      8: 1,
      9: 2,
      10: 2,
      11: 2,
    }
  },
  {
    id: 3,
    cabinet_id: 3,
    timestamp: tomorrow.toISOString(),
    mapping: {
      0: 2,
      1: 2,
      2: 2,
      3: 1,
      4: 1,
      5: 1,
      6: 2,
      7: 2,
      8: 2,
      9: 1,
      10: 1,
      11: 1,
    }
  },
  {
    id: 4,
    cabinet_id: 3,
    timestamp: nextWeek.toISOString(),
    mapping: {
      0: 3,
      1: 3,
      2: 4,
      3: 4,
      4: 3,
      5: 3,
      6: 4,
      7: 4,
      8: 3,
      9: 3,
      10: 4,
      11: 4,
    }
  },
  {
    id: 5,
    cabinet_id: 3,
    timestamp: nextMonth.toISOString(),
    mapping: {
      0: 1,
      1: 0,
      2: 2,
      3: 0,
      4: 1,
      5: 2,
      6: 0,
      7: 1,
      8: 2,
      9: 0,
      10: 1,
      11: 2,
    }
  }
];

let nextId = 6;

export const planogramService = {
  async getAll() {
    return Promise.resolve([...planograms]);
  },

  async getById(id) {
    const planogram = planograms.find(p => p.id === parseInt(id));
    return Promise.resolve(planogram ? { ...planogram } : null);
  },

  async create(planogram) {
    const newPlanogram = {
      id: nextId++,
      cabinet_id: planogram.cabinet_id,
      timestamp: planogram.timestamp instanceof Date
        ? planogram.timestamp.toISOString()
        : planogram.timestamp,
      mapping: { ...planogram.mapping }
    };
    planograms.push(newPlanogram);
    return Promise.resolve({ ...newPlanogram });
  },

  async update(id, planogram) {
    const index = planograms.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return Promise.resolve(null);
    }
    const updated = {
      id: parseInt(id),
      cabinet_id: planogram.cabinet_id,
      timestamp: planogram.timestamp instanceof Date
        ? planogram.timestamp.toISOString()
        : planogram.timestamp,
      mapping: { ...planogram.mapping }
    };
    planograms[index] = updated;
    return Promise.resolve({ ...updated });
  },

  async delete(id) {
    const index = planograms.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return Promise.resolve(false);
    }
    planograms.splice(index, 1);
    return Promise.resolve(true);
  }
};

