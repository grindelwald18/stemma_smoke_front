import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Spin, 
  message, 
  Alert,
  Row,
  Col,
  Divider
} from 'antd';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { planogramService } from '../services/planogramService.js';
import { cabinetService } from '../services/cabinetService.js';
import './PlanogramForm.css';

// Устанавливаем русскую локаль для dayjs
dayjs.locale('ru');

const { Title, Text } = Typography;

export default function PlanogramForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
        message.error('Планограмма не найдена');
        return;
      }

      const cabinet = await cabinetService.getById(planogram.cabinet_id);
      setSelectedCabinet(cabinet);

      // Устанавливаем значения формы
      form.setFieldsValue({
        cabinet_id: planogram.cabinet_id,
        timestamp: dayjs(planogram.timestamp),
        mapping: planogram.mapping
      });
    } catch (err) {
      setError('Ошибка при загрузке планограммы');
      message.error('Ошибка при загрузке планограммы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCabinetChange = async (cabinetId) => {
    if (cabinetId) {
      const cabinet = await cabinetService.getById(cabinetId);
      setSelectedCabinet(cabinet);

      // Инициализируем маппинг для всех пушеров пустыми значениями
      if (cabinet) {
        const currentMapping = form.getFieldValue('mapping') || {};
        const newMapping = {};
        cabinet.shelves.forEach(shelf => {
          shelf.dispensers.forEach(dispenser => {
            newMapping[dispenser.id] = currentMapping[dispenser.id] || 0;
          });
        });
        form.setFieldValue('mapping', newMapping);
      }
    } else {
      setSelectedCabinet(null);
      form.setFieldValue('mapping', {});
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);

    try {
      // Преобразуем dayjs в Date
      const timestamp = values.timestamp ? (dayjs.isDayjs(values.timestamp) ? values.timestamp.toDate() : new Date(values.timestamp)) : new Date();
      
      // Очищаем маппинг от undefined значений
      const mapping = {};
      if (values.mapping) {
        Object.keys(values.mapping).forEach(key => {
          const value = values.mapping[key];
          mapping[key] = value !== undefined && value !== null ? parseInt(value) || 0 : 0;
        });
      }

      const planogram = {
        id: isEdit ? parseInt(id) : 0,
        cabinet_id: values.cabinet_id,
        timestamp: timestamp,
        mapping: mapping
      };

      if (isEdit) {
        await planogramService.update(id, planogram);
        message.success('Планограмма успешно обновлена');
      } else {
        await planogramService.create(planogram);
        message.success('Планограмма успешно создана');
      }

      navigate('/planograms');
    } catch (err) {
      setError('Ошибка при сохранении планограммы');
      message.error('Ошибка при сохранении планограммы');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Получаем все пушеры из всех полок выбранного шкафа
  const allDispensers = selectedCabinet
    ? selectedCabinet.shelves.flatMap(shelf => shelf.dispensers)
    : [];

  if (loading) {
    return (
      <div className="planogram-form-container">
        <Spin size="large" tip="Загрузка..." />
      </div>
    );
  }

  return (
    <div className="planogram-form-container">
      <div className="planogram-form-header">
        <Title level={2}>{isEdit ? 'Редактировать планограмму' : 'Создать планограмму'}</Title>
        <Button
          icon={<FaArrowLeft />}
          onClick={() => navigate('/planograms')}
        >
          Назад к списку
        </Button>
      </div>

      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Card className="planogram-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mapping: {}
          }}
          size="large"
        >
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="cabinet_id"
                label={<span style={{ fontWeight: 500 }}>Шкаф</span>}
                rules={[{ required: true, message: 'Пожалуйста, выберите шкаф' }]}
              >
                <Select
                  placeholder="Выберите шкаф"
                  onChange={handleCabinetChange}
                  disabled={isEdit}
                  allowClear
                >
                  {cabinets.map(cabinet => (
                    <Select.Option key={cabinet.id} value={cabinet.id}>
                      Шкаф #{cabinet.id}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="timestamp"
                label={<span style={{ fontWeight: 500 }}>Валидна до</span>}
                rules={[{ required: true, message: 'Пожалуйста, выберите дату и время' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Выберите дату и время"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedCabinet && allDispensers.length > 0 && (
            <>
              <Divider orientation="left" style={{ marginTop: 32, marginBottom: 24 }}>
                <Typography.Text strong>Маппинг пушеров в СКЮ</Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  (0 означает, что пушер должен быть пустым)
                </Typography.Text>
              </Divider>

              <Row gutter={[16, 16]}>
                {allDispensers.map(dispenser => (
                  <Col xs={12} sm={8} md={6} lg={4} xl={3} key={dispenser.id}>
                    <Form.Item
                      name={['mapping', dispenser.id]}
                      label={<span style={{ fontSize: 13 }}>Пушер #{dispenser.id}</span>}
                      initialValue={0}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={0}
                        placeholder="СКЮ"
                        style={{ width: '100%' }}
                        parser={(value) => value ? value.replace(/\D/g, '') : ''}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </>
          )}

          <Divider style={{ marginTop: 32, marginBottom: 24 }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<FaSave />}
                size="large"
              >
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button
                onClick={() => navigate('/planograms')}
                disabled={saving}
                size="large"
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

