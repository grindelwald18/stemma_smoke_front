import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planogramService } from '../services/planogramService.js';
import { Planogram } from '../models/Planogram.js';
import './PlanogramList.css';

export default function PlanogramList() {
  const [planograms, setPlanograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlanograms();
  }, []);

  const loadPlanograms = async () => {
    try {
      setLoading(true);
      const data = await planogramService.getAll();
      setPlanograms(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке планограмм');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту планограмму?')) {
      return;
    }

    try {
      const success = await planogramService.delete(id);
      if (success) {
        setPlanograms(planograms.filter(p => p.id !== id));
      } else {
        setError('Не удалось удалить планограмму');
      }
    } catch (err) {
      setError('Ошибка при удалении планограммы');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="planogram-list-container">Загрузка...</div>;
  }

  return (
    <div className="planogram-list-container">
      <div className="planogram-list-header">
        <h1>Планограммы</h1>
        <Link to="/planograms/new" className="btn btn-primary">
          Создать планограмму
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {planograms.length === 0 ? (
        <div className="empty-state">
          <p>Планограммы не найдены</p>
          <Link to="/planograms/new" className="btn btn-primary">
            Создать первую планограмму
          </Link>
        </div>
      ) : (
        <div className="planogram-grid">
          {planograms.map(planogram => (
            <div key={planogram.id} className="planogram-card">
              <div className="planogram-card-header">
                <h3>Планограмма #{planogram.id}</h3>
                <div className="planogram-card-actions">
                  <Link
                    to={`/planograms/${planogram.id}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(planogram.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div className="planogram-card-body">
                <p><strong>Шкаф ID:</strong> {planogram.cabinet_id}</p>
                <p><strong>Валидна до:</strong> {new Date(planogram.timestamp).toLocaleString('ru-RU')}</p>
                <p><strong>Количество пушеров:</strong> {Object.keys(planogram.mapping).length}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

