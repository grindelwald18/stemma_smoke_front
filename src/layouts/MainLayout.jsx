import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Typography } from 'antd';
import { FaTh, FaSignOutAlt } from 'react-icons/fa';
import './MainLayout.css';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function MainLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/planograms',
      icon: <FaTh />,
      label: 'Планограммы',
    },
  ];

  const handleMenuClick = (key) => {
    navigate(key);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <Title level={3} className="header-title">
            Stemma Smoke
          </Title>
          <div className="header-actions">
            <div className="menu-blocks">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  className={`menu-item ${location.pathname === item.key ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <Button
              type="primary"
              danger
              icon={<FaSignOutAlt />}
              onClick={handleLogout}
            >
              Выход
            </Button>
          </div>
        </div>
      </Header>
      <Content className="main-content">
        <Outlet />
      </Content>
    </Layout>
  );
}

