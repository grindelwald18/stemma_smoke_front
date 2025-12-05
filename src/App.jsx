import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './App.css';

// Устанавливаем русскую локаль для dayjs
dayjs.locale('ru');

// Кастомная тема Ant Design с нашими цветами
const theme = {
  token: {
    colorPrimary: '#00bb31',
    colorSuccess: '#00bb31',
    colorInfo: '#00bb31',
    borderRadius: 6,
    fontFamily: '"Aptos", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      fontWeight: 500,
    },
    Menu: {
      itemSelectedBg: 'transparent',
      itemHoverBg: 'transparent',
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={theme} locale={ruRU}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
