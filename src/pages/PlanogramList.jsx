import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Tag, Empty, Spin, Popconfirm, Alert } from 'antd';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaTh } from 'react-icons/fa';
import { usePlanogramStore } from '../stores';
import './PlanogramList.css';

const { Title, Text } = Typography;

export default function PlanogramList() {
  const navigate = useNavigate();

  const {
    planograms,
    loading,
    error,
    fetchPlanograms,
    deletePlanogram
  } = usePlanogramStore();

  useEffect(() => {
    fetchPlanograms();
  }, [fetchPlanograms]);

  const handleDelete = async (id) => {
    await deletePlanogram(id);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDispenserCount = (mapping) => {
    return Object.keys(mapping).length;
  };

  const getFilledDispensers = (mapping) => {
    return Object.values(mapping).filter(skuId => skuId !== 0).length;
  };

  if (loading) {
    return (
      <div className="planogram-list-container">
        <Spin size="large" tip="Загрузка планограмм..." />
      </div>
    );
  }

  return (
    <div className="planogram-list-container">
      <div className="planogram-list-header">
        <Title level={2}>Планограммы</Title>
        <Button
          type="primary"
          icon={<FaPlus />}
          onClick={() => navigate('/planograms/new')}
          size="large"
        >
          Создать планограмму
        </Button>
      </div>
      {error && <Alert message={error} type="error" />}

      {planograms.length === 0 ? (
        <Empty
          description="Планограммы не найдены"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => navigate('/planograms/new')}
          >
            Создать первую планограмму
          </Button>
        </Empty>
      ) : (
        <div className="planogram-grid">
          {planograms.map(planogram => (
            <Card
              key={planogram.id}
              className="planogram-card"
              hoverable
              actions={[
                <Button
                  type="link"
                  icon={<FaEdit />}
                  onClick={() => navigate(`/planograms/${planogram.id}/edit`)}
                >
                  Редактировать
                </Button>,
                <Popconfirm
                  title="Удалить планограмму?"
                  description="Вы уверены, что хотите удалить эту планограмму?"
                  onConfirm={() => handleDelete(planogram.id)}
                  okText="Да"
                  cancelText="Нет"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="link"
                    danger
                    icon={<FaTrash />}
                  >
                    Удалить
                  </Button>
                </Popconfirm>
              ]}
            >
              <Card.Meta
                title={
                  <Space>
                    <Text strong>Планограмма #{planogram.id}</Text>
                    <Tag color="blue">Шкаф {planogram.cabinet_id || planogram.cabinet?.id || 'N/A'}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <FaCalendarAlt />
                      <Text type="secondary">
                        Валидна до: {formatDate(planogram.timestamp)}
                      </Text>
                    </Space>
                    <Space>
                      <FaTh />
                      <Text type="secondary">
                        Пушеров: {getDispenserCount(planogram.mapping)}
                        {' '}(заполнено: {getFilledDispensers(planogram.mapping)})
                      </Text>
                    </Space>
                  </Space>
                }
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

