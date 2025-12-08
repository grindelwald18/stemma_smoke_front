import React, { useState, useEffect } from 'react';
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
import { usePlanogramStore, useCabinetStore, useSkuStore } from '../stores';
import ShowcaseGrid from './ShowcaseGrid/index.jsx';
import './PlanogramForm.css';

dayjs.locale('ru');

const { Title, Text } = Typography;

export default function PlanogramForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const {
    loading: planogramLoading,
    error: planogramError,
    fetchPlanogramById,
    createPlanogram,
    updatePlanogram
  } = usePlanogramStore();

  const {
    cabinets,
    currentCabinet,
    loading: cabinetLoading,
    fetchCabinets,
    fetchCabinetById,
    setCurrentCabinet
  } = useCabinetStore();

  const {
    skus,
    loading: skuLoading,
    fetchSkus
  } = useSkuStore();

  const [saving, setSaving] = useState(false);
  const selectedCabinet = currentCabinet;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDispenserId, setSelectedDispenserId] = useState(null);
  const [modalForm] = Form.useForm();
  const [mappingUpdateKey, setMappingUpdateKey] = useState(0);


  const [mappingValue, setMappingValue] = useState({});

  const availableSkus = React.useMemo(() => {
    return skus.map(sku => ({
      value: sku.id,
      label: sku.name || `SKU ${sku.id}`,
      name: sku.name,
      id: sku.id,
      image: sku.image || null
    }));
  }, [skus]);

  const [selectedSkuInModal, setSelectedSkuInModal] = React.useState(null);

  useEffect(() => {
    fetchCabinets();
    fetchSkus();

    if (isEdit) {
      loadPlanogram();
    }
  }, [id]);

  const loadPlanogram = async () => {
    try {
      const planogram = await fetchPlanogramById(id);
      if (!planogram) {
        return;
      }

      if (planogram.cabinet) {
        setCurrentCabinet(planogram.cabinet);
      } else if (planogram.cabinet_id) {
        const cabinet = await fetchCabinetById(planogram.cabinet_id);
        if (cabinet) {
          setCurrentCabinet(cabinet);
        }
      }

      const normalizedMapping = {};
      if (planogram.mapping) {
        Object.keys(planogram.mapping).forEach(key => {
          const numKey = parseInt(key);
          if (!isNaN(numKey)) {
            normalizedMapping[numKey] = planogram.mapping[key];
          }
        });
      }

      form.setFieldsValue({
        cabinet_id: planogram.cabinet_id,
        timestamp: dayjs(planogram.timestamp),
        mapping: normalizedMapping
      });

      setMappingValue(normalizedMapping);

      setTimeout(() => {
        setMappingUpdateKey(prev => prev + 1);
      }, 100);
    } catch (err) {
      console.error('Ошибка при загрузке планограммы:', err);
    }
  };

  const handleCabinetChange = async (cabinetId) => {
    if (cabinetId) {
      const cabinet = await fetchCabinetById(cabinetId);
      if (cabinet) {
        setCurrentCabinet(cabinet);

        const currentMapping = form.getFieldValue('mapping') || {};
        const newMapping = {};
        cabinet.shelves.forEach(shelf => {
          shelf.dispensers.forEach(dispenser => {
            newMapping[dispenser.id] = currentMapping[dispenser.id] || 0;
          });
        });
        form.setFieldValue('mapping', newMapping);
        setMappingValue(newMapping);
      }
    } else {
      setCurrentCabinet(null);
      form.setFieldValue('mapping', {});
      setMappingValue({});
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);

    try {
      if (!selectedCabinet) {
        message.error('Пожалуйста, выберите шкаф');
        setSaving(false);
        return;
      }

      const timestamp = values.timestamp ? (dayjs.isDayjs(values.timestamp) ? values.timestamp.toDate() : new Date(values.timestamp)) : new Date();

      const mapping = {};

      const allDispensers = selectedCabinet.shelves.flatMap(shelf => shelf.dispensers || []);

      const formMappingFromForm = form.getFieldValue('mapping') || {};
      const formMappingFromState = mappingValue || {};

      const formMapping = { ...formMappingFromForm, ...formMappingFromState };

      allDispensers.forEach(dispenser => {
        const dispenserId = dispenser.id;

        let value = formMappingFromState[dispenserId];
        if (value === undefined || value === null) {
          value = formMappingFromState[String(dispenserId)];
        }
        if (value === undefined || value === null) {
          value = formMappingFromForm[dispenserId];
        }
        if (value === undefined || value === null) {
          value = formMappingFromForm[String(dispenserId)];
        }
        if (value === undefined || value === null) {
          value = formMapping[dispenserId] ?? formMapping[String(dispenserId)];
        }

        let normalizedValue = 0;
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && 'id' in value) {
            normalizedValue = parseInt(value.id) || 0;
          } else {
            normalizedValue = parseInt(value) || 0;
          }
        }
        mapping[String(dispenserId)] = normalizedValue;
      });

      const cabinetToSend = currentCabinet || selectedCabinet;

      if (!cabinetToSend) {
        message.error('Ошибка: объект шкафа не найден. Пожалуйста, выберите шкаф.');
        setSaving(false);
        return;
      }

      const planogram = {
        id: isEdit ? parseInt(id) : 0,
        cabinet_id: values.cabinet_id,
        cabinet: cabinetToSend,
        timestamp: timestamp,
        mapping: mapping
      };

      if (isEdit) {
        await updatePlanogram(id, planogram, skus);
      } else {
        await createPlanogram(planogram, skus);
      }

      navigate('/planograms');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const allDispensers = selectedCabinet
    ? selectedCabinet.shelves.flatMap(shelf => shelf.dispensers || [])
    : [];


  const getGridDimensions = () => {
    if (!selectedCabinet || !selectedCabinet.shelves || selectedCabinet.shelves.length === 0) {
      return { rowCount: 6, columnCount: 8 };
    }
    const rowCount = selectedCabinet.shelves.length;

    const columnCount = Math.max(
      ...selectedCabinet.shelves.map(shelf => shelf.dispensers ? shelf.dispensers.length : 0),
      8
    );

    return { rowCount, columnCount };
  };

  const { rowCount, columnCount } = getGridDimensions();

  const currentMapping = React.useMemo(() => {
    const mapping = mappingValue || {};
    const normalized = {};

    Object.keys(mapping).forEach(key => {
      const numKey = parseInt(key);
      if (!isNaN(numKey)) {
        normalized[numKey] = mapping[key];
        normalized[String(numKey)] = mapping[key];
      } else {
        normalized[key] = mapping[key];
      }
    });

    return normalized;
  }, [mappingValue]);

  const handleDispenserClick = (dispenserId) => {
    setSelectedDispenserId(dispenserId);
    const currentSkuValue = currentMapping[dispenserId] || currentMapping[String(dispenserId)] || 0;

    let currentSku = 0;
    if (currentSkuValue !== undefined && currentSkuValue !== null) {
      if (typeof currentSkuValue === 'object' && 'id' in currentSkuValue) {
        currentSku = currentSkuValue.id || 0;
        if (currentSkuValue.image) {
          setSelectedSkuInModal({ id: currentSku, image: currentSkuValue.image, name: currentSkuValue.name });
        } else {
          const skuData = availableSkus.find(s => s.value === currentSku);
          setSelectedSkuInModal(skuData || null);
        }
      } else {
        currentSku = parseInt(currentSkuValue) || 0;
        const skuData = availableSkus.find(s => s.value === currentSku);
        setSelectedSkuInModal(skuData || null);
      }
    } else {
      setSelectedSkuInModal(null);
    }

    modalForm.setFieldsValue({
      sku: currentSku === 0 ? undefined : currentSku,
      skuInput: currentSku === 0 ? undefined : currentSku
    });
    setModalVisible(true);
  };

  const updateMapping = (skuValue) => {
    if (selectedDispenserId === null) return;

    const currentMapping = mappingValue || form.getFieldValue('mapping') || {};

    let skuDataToSave = null;
    if (skuValue !== undefined && skuValue !== null && skuValue !== 0) {
      if (selectedSkuInModal && selectedSkuInModal.id === skuValue) {
        skuDataToSave = {
          id: selectedSkuInModal.id,
          name: selectedSkuInModal.name || null,
          image: selectedSkuInModal.image || null
        };
      } else {
        const skuFromList = availableSkus.find(s => s.value === skuValue);
        if (skuFromList) {
          skuDataToSave = {
            id: skuFromList.id,
            name: skuFromList.name || null,
            image: skuFromList.image || null
          };
        } else {
          skuDataToSave = {
            id: skuValue,
            name: null,
            image: null
          };
        }
      }
    } else {
      skuDataToSave = {
        id: 0,
        name: "Пусто",
        image: null
      };
    }

    const newMapping = {
      ...currentMapping,
      [selectedDispenserId]: skuDataToSave,
      [String(selectedDispenserId)]: skuDataToSave
    };

    form.setFieldValue({
      mapping: newMapping
    });

    setMappingValue(newMapping);
    setMappingUpdateKey(prev => prev + 1);

  };

  const handleSkuChange = (value, skuData = null) => {
    const skuValue = value !== undefined && value !== null ? value : 0;
    if (skuData) {
      setSelectedSkuInModal(skuData);
    }
    updateMapping(skuValue);
  };

  const handleModalSave = () => {
    modalForm.validateFields().then((values) => {
      const skuValue = values.skuInput !== undefined && values.skuInput !== null
        ? values.skuInput
        : (values.sku !== undefined && values.sku !== null ? values.sku : 0);

      updateMapping(skuValue);

      setModalVisible(false);
      setSelectedDispenserId(null);
      setSelectedSkuInModal(null);
      modalForm.resetFields();
      message.success('SKU обновлен');
    }).catch(() => {
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedDispenserId(null);
    setSelectedSkuInModal(null);
    modalForm.resetFields();
  };

  const getImageSrc = (skuData) => {
    if (!skuData || !skuData.image) {
      return '/image.png';
    }

    const image = skuData.image;
    if (typeof image === 'string' && image.startsWith('data:')) {
      return image;
    }

    const cleanBase64 = image.trim().replace(/\s/g, '');

    let mimeType = 'image/jpeg';
    if (cleanBase64.startsWith('/9j/') || cleanBase64.startsWith('i/9j/')) {
      mimeType = 'image/jpeg';
    } else if (cleanBase64.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    } else if (cleanBase64.startsWith('R0lGODlh') || cleanBase64.startsWith('R0lGODdh')) {
      mimeType = 'image/gif';
    }

    return `data:${mimeType};base64,${cleanBase64}`;
  };

  const loading = planogramLoading || cabinetLoading || skuLoading;

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

      {planogramError && (
        <Alert
          message="Ошибка"
          description={planogramError}
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
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const label = (option?.label ?? '').toLowerCase();
                const name = (option?.name ?? '').toLowerCase();
                const id = String(option?.id ?? '').toLowerCase();

                return label.includes(searchText) ||
                  name.includes(searchText) ||
                  id.includes(searchText);
              }}
              notFoundContent={null}
              onChange={(value) => {
                modalForm.setFieldValue('skuInput', value !== undefined && value !== null ? value : undefined);
                if (value !== undefined && value !== null && value !== 0) {
                  const skuData = availableSkus.find(s => s.value === value);
                  setSelectedSkuInModal(skuData || null);
                  handleSkuChange(value, skuData || null);
                } else {
                  setSelectedSkuInModal(null);
                  handleSkuChange(value, null);
                }
              }}
            >
              <Select.Option value={0} name="Пусто" id={0}>Пусто (0)</Select.Option>
              {availableSkus
                .filter(sku => sku.value !== 0)
                .map(sku => (
                  <Select.Option
                    key={sku.value}
                    value={sku.value}
                    name={sku.name}
                    id={sku.id}
                  >
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
                modalForm.setFieldValue('sku', value !== null && value !== undefined ? value : undefined);
                if (value !== null && value !== undefined && value !== 0) {
                  const skuData = availableSkus.find(s => s.value === value);
                  setSelectedSkuInModal(skuData || null);
                  handleSkuChange(value, skuData || null);
                } else {
                  setSelectedSkuInModal(null);
                  handleSkuChange(value, null);
                }
              }}
              onPressEnter={handleModalSave}
            />
          </Form.Item>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Текущее значение: {(() => {
              const currentValue = currentMapping[selectedDispenserId] || currentMapping[String(selectedDispenserId)];
              if (currentValue === undefined || currentValue === null) return 0;
              if (typeof currentValue === 'object' && 'id' in currentValue) {
                return currentValue.id || 0;
              }
              return currentValue;
            })()}
          </Typography.Text>

          {selectedSkuInModal && selectedSkuInModal.image && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                Изображение товара:
              </Typography.Text>
              <img
                src={getImageSrc(selectedSkuInModal)}
                alt={selectedSkuInModal.name || 'SKU image'}
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  padding: '8px',
                  backgroundColor: '#fafafa'
                }}
                onError={(e) => {
                  e.target.src = '/image.png';
                }}
              />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}

