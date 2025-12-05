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
  Divider,
  Modal
} from 'antd';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { planogramService } from '../services/planogramService.js';
import { cabinetService } from '../services/cabinetService.js';
import ShowcaseGrid from './ShowcaseGrid/index.jsx';
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

  // Состояние для модалки редактирования SKU
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDispenserId, setSelectedDispenserId] = useState(null);
  const [modalForm] = Form.useForm();
  const [mappingUpdateKey, setMappingUpdateKey] = useState(0);

  // Отслеживаем изменения mapping для обновления визуализации
  const mappingValue = Form.useWatch('mapping', form) || {};

  // Моковый список доступных SKU (в реальном приложении будет загружаться с сервера)
  const availableSkus = [
    { value: 1, label: 'SKU 1' },
    { value: 2, label: 'SKU 2' },
    { value: 3, label: 'SKU 3' },
    { value: 4, label: 'SKU 4' },
    { value: 5, label: 'SKU 5' },
  ];

  useEffect(() => {
    loadCabinets();
    if (isEdit) {
      loadPlanogram();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    ? selectedCabinet.shelves.flatMap(shelf => shelf.dispensers || [])
    : [];


  // Вычисляем размеры сетки на основе структуры шкафа
  const getGridDimensions = () => {
    if (!selectedCabinet || !selectedCabinet.shelves || selectedCabinet.shelves.length === 0) {
      return { rowCount: 6, columnCount: 8 };
    }

    // Количество строк = количество полок
    const rowCount = selectedCabinet.shelves.length;

    // Количество столбцов = максимальное количество пушеров на полке
    const columnCount = Math.max(
      ...selectedCabinet.shelves.map(shelf => shelf.dispensers ? shelf.dispensers.length : 0),
      8 // минимум 8 столбцов
    );

    return { rowCount, columnCount };
  };

  const { rowCount, columnCount } = getGridDimensions();

  // Используем отслеживаемое значение mapping
  const currentMapping = mappingValue;

  // Обработчик клика на пушер в сетке
  const handleDispenserClick = (dispenserId) => {
    setSelectedDispenserId(dispenserId);
    const currentSku = currentMapping[dispenserId] || 0;
    modalForm.setFieldsValue({
      sku: currentSku === 0 ? undefined : currentSku,
      skuInput: currentSku === 0 ? undefined : currentSku
    });
    setModalVisible(true);
  };

  // Функция для обновления mapping (используется и при изменении, и при сохранении)
  const updateMapping = (skuValue) => {
    if (selectedDispenserId === null) return;

    // Обновляем значение в форме
    const currentMapping = form.getFieldValue('mapping') || {};
    const newMapping = {
      ...currentMapping,
      [selectedDispenserId]: skuValue
    };

    form.setFieldValue({
      mapping: newMapping
    });

    // Принудительно обновляем состояние для визуализации
    setMappingUpdateKey(prev => prev + 1);
  };

  // Обработчик изменения SKU в реальном времени
  const handleSkuChange = (value) => {
    const skuValue = value !== undefined && value !== null ? value : 0;
    updateMapping(skuValue);
  };

  // Обработчик сохранения SKU из модалки
  const handleModalSave = () => {
    modalForm.validateFields().then((values) => {
      // Получаем значение из Select или InputNumber (приоритет у InputNumber, если заполнен)
      const skuValue = values.skuInput !== undefined && values.skuInput !== null
        ? values.skuInput
        : (values.sku !== undefined && values.sku !== null ? values.sku : 0);

      // Обновляем значение (если еще не обновлено)
      updateMapping(skuValue);

      setModalVisible(false);
      setSelectedDispenserId(null);
      modalForm.resetFields();
      message.success('SKU обновлен');
    }).catch(() => {
      // Ошибка валидации
    });
  };

  // Обработчик закрытия модалки
  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedDispenserId(null);
    modalForm.resetFields();
  };

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
                <Typography.Text strong>Визуализация планограммы</Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  (кликните на ячейку для редактирования)
                </Typography.Text>
              </Divider>

              <div style={{ marginBottom: 24 }}>
                <ShowcaseGrid
                  key={mappingUpdateKey}
                  rowCount={rowCount}
                  columnCount={columnCount}
                  mapping={currentMapping}
                  discrepancies={{}}
                  onDispenserClick={handleDispenserClick}
                  dispensers={allDispensers}
                />
              </div>

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

      {/* Модальное окно для редактирования SKU */}
      <Modal
        title={`Редактирование пушера #${selectedDispenserId}`}
        open={modalVisible}
        onOk={handleModalSave}
        onCancel={handleModalCancel}
        okText="Сохранить"
        cancelText="Отмена"
        width={500}
      >
        <Form
          form={modalForm}
          layout="vertical"
          initialValues={{ sku: undefined }}
        >
          <Form.Item
            name="sku"
            label="СКЮ"
            tooltip="Выберите SKU из списка или введите вручную. 0 означает, что пушер должен быть пустым."
          >
            <Select
              showSearch
              allowClear
              placeholder="Выберите SKU"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={null}
              onChange={(value) => {
                // Синхронизируем с InputNumber
                modalForm.setFieldValue('skuInput', value !== undefined && value !== null ? value : undefined);
                // Обновляем mapping сразу при изменении
                handleSkuChange(value);
              }}
            >
              <Select.Option value={0}>Пусто (0)</Select.Option>
              {availableSkus.map(sku => (
                <Select.Option key={sku.value} value={sku.value}>
                  {sku.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="skuInput"
            label="Или введите SKU вручную"
          >
            <InputNumber
              min={0}
              placeholder="Введите SKU ID"
              style={{ width: '100%' }}
              onChange={(value) => {
                // Синхронизируем с Select
                modalForm.setFieldValue('sku', value !== null && value !== undefined ? value : undefined);
                // Обновляем mapping сразу при изменении
                handleSkuChange(value);
              }}
              onPressEnter={handleModalSave}
            />
          </Form.Item>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Текущее значение: {currentMapping[selectedDispenserId] !== undefined ? currentMapping[selectedDispenserId] : 0}
          </Typography.Text>
        </Form>
      </Modal>
    </div>
  );
}

