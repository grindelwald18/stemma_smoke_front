import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import './RegisterPage.css';

const { Title } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);

    // Имитация запроса к API
    try {
      // Здесь будет запрос к API для регистрации
      console.log('Register attempt:', { username: values.username, email: values.email });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // После успешной регистрации перенаправляем на страницу авторизации
      message.success('Регистрация успешна!');
      navigate('/login');
    } catch (err) {
      setError('Ошибка при регистрации. Попробуйте еще раз.');
      message.error('Ошибка при регистрации');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Card className="register-card">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Регистрация
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="username"
            label="Логин"
            rules={[
              { required: true, message: 'Пожалуйста, введите логин' },
              { min: 3, message: 'Логин должен содержать минимум 3 символа' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Введите логин"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Пожалуйста, введите email' },
              { type: 'email', message: 'Введите корректный email адрес' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Введите email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Пожалуйста, введите пароль' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Введите пароль"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Подтвердите пароль"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Пожалуйста, подтвердите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Повторите пароль"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44 }}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div className="register-footer">
            <span>Уже есть аккаунт?</span>
            <Link to="/login">Войти</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

