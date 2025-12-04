import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { planogramService } from '../services/planogramService.js';
import { cabinetService } from '../services/cabinetService.js';
import { Planogram } from '../models/Planogram.js';
import './PlanogramForm.css';

export default function PlanogramForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [cabinetId, setCabinetId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [mapping, setMapping] = useState({});
  
  const [cabinets, setCabinets] = useState([]);
  const [selectedCabinet, setSelectedCabinet] = useState(null);

  useEffect(() => {
    loadCabinets();
    if (isEdit) {
      loadPlanogram();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadCabinets = async () => {
    try {
      const data = await cabinetService.getAll();
      setCabinets(data);
    } catch (err) {
      console.error('Ошибка при загрузке шкафов:', err);
    }
  };

  const loadPlanogram = async () => {
    try {
      setLoading(true);
      const planogram = await planogramService.getById(id);
      if (!planogram) {
        setError('Планограмма не найдена');
        return;
      }
      setCabinetId(planogram.cabinet_id.toString());
      setTimestamp(new Date(planogram.timestamp).toISOString().slice(0, 16));
      setMapping({ ...planogram.mapping });
      
      const cabinet = await cabinetService.getById(planogram.cabinet_id);
      setSelectedCabinet(cabinet);
    } catch (err) {
      setError('Ошибка при загрузке планограммы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCabinetChange = async (e) => {
    const newCabinetId = e.target.value;
    setCabinetId(newCabinetId);
    
    if (newCabinetId) {
      const cabinet = await cabinetService.getById(newCabinetId);
      setSelectedCabinet(cabinet);
      
      // Инициализируем маппинг для всех пушеров пустыми значениями
      if (cabinet) {
        const newMapping = {};
        cabinet.shelves.forEach(shelf => {
          shelf.dispensers.forEach(dispenser => {
            newMapping[dispenser.id] = mapping[dispenser.id] || 0;
          });
        });
        setMapping(newMapping);
      }
    } else {
      setSelectedCabinet(null);
      setMapping({});
    }
  };

  const handleDispenserChange = (dispenserId, skuId) => {
    setMapping({
      ...mapping,
      [dispenserId]: skuId === '' ? 0 : parseInt(skuId) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const planogram = new Planogram(
        isEdit ? parseInt(id) : 0,
        parseInt(cabinetId),
        new Date(timestamp),
        mapping
      );

      if (isEdit) {
        await planogramService.update(id, planogram);
      } else {
        await planogramService.create(planogram);
      }

      navigate('/planograms');
    } catch (err) {
      setError('Ошибка при сохранении планограммы');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="planogram-form-container">Загрузка...</div>;
  }

  // Получаем все пушеры из всех полок выбранного шкафа
  const allDispensers = selectedCabinet
    ? selectedCabinet.shelves.flatMap(shelf => shelf.dispensers)
    : [];

  return (
    <div className="planogram-form-container">
      <div className="planogram-form-header">
        <h1>{isEdit ? 'Редактировать планограмму' : 'Создать планограмму'}</h1>
        <button onClick={() => navigate('/planograms')} className="btn btn-secondary">
          Назад к списку
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="planogram-form">
        <div className="form-group">
          <label htmlFor="cabinetId">Шкаф *</label>
          <select
            id="cabinetId"
            value={cabinetId}
            onChange={handleCabinetChange}
            required
            disabled={isEdit}
          >
            <option value="">Выберите шкаф</option>
            {cabinets.map(cabinet => (
              <option key={cabinet.id} value={cabinet.id}>
                Шкаф #{cabinet.id}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timestamp">Валидна до *</label>
          <input
            type="datetime-local"
            id="timestamp"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
          />
        </div>

        {selectedCabinet && allDispensers.length > 0 && (
          <div className="form-group">
            <label>Маппинг пушеров в СКЮ</label>
            <p className="form-hint">0 означает, что пушер должен быть пустым</p>
            <div className="dispensers-grid">
              {allDispensers.map(dispenser => (
                <div key={dispenser.id} className="dispenser-item">
                  <label htmlFor={`dispenser-${dispenser.id}`}>
                    Пушер #{dispenser.id}
                  </label>
                  <input
                    type="number"
                    id={`dispenser-${dispenser.id}`}
                    min="0"
                    value={mapping[dispenser.id] || 0}
                    onChange={(e) => handleDispenserChange(dispenser.id, e.target.value)}
                    placeholder="СКЮ ID"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/planograms')}
            className="btn btn-secondary"
            disabled={saving}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

