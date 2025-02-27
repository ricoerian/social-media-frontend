import React from 'react';
import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const screens = useBreakpoint();
  const isMobile = !screens.md; // Anggap mobile jika layar kurang dari breakpoint md

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Definisikan menuItems dengan label berupa elemen Link (kecuali logout)
  const menuItems = token
    ? [
        {
          key: 'feeds',
          icon: <HomeOutlined />,
          label: <Link to="/">Feeds</Link>,
        },
        {
          key: 'chat',
          icon: <MessageOutlined />,
          label: <Link to="/chat">Chat</Link>,
        },
        {
          key: 'search',
          icon: <SearchOutlined />,
          label: <Link to="/search">Search</Link>,
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: <Link to="/profile">Profile</Link>,
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
          className: '!text-red-500',
        },
      ]
    : [
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: <Link to="/login">Login</Link>,
        },
        {
          key: 'register',
          icon: <UserAddOutlined />,
          label: <Link to="/register">Register</Link>,
        },
      ];

  return (
    <>
      {isMobile ? (
        <>
          {/* Top Navbar: hanya menampilkan logo */}
          <div className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center h-16">
                <div className="text-2xl font-bold text-blue-500">
                  <Link to="/">FeedsApp</Link>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Tab Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white shadow-t py-2 flex justify-around items-center z-50">
            {menuItems.map((item) => {
              // Untuk item logout, panggil fungsi langsung
              if (item.key === 'logout') {
                return (
                  <div
                    key={item.key}
                    className="flex flex-col items-center text-xl text-red-500"
                    onClick={handleLogout}
                  >
                    {item.icon}
                  </div>
                );
              }
              // Untuk item non-logout, ambil properti "to" dari elemen Link di label
              if (React.isValidElement(item.label)) {
                const to = (item.label as React.ReactElement<{ to: string }>).props.to;
                return (
                  <div key={item.key} className="flex flex-col items-center text-xl">
                    <Link to={to}>{item.icon}</Link>
                  </div>
                );
              }
              return (
                <div key={item.key} className="flex flex-col items-center text-xl">
                  {item.icon}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // Desktop/Tablet View: Navbar horizontal di atas
        <div className="bg-white shadow-md top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="text-2xl font-bold text-blue-500">
                <Link to="/">FeedsApp</Link>
              </div>
              <Menu
                mode="horizontal"
                className="!border-0"
                selectable={false}
                items={menuItems.map((item) => ({
                  key: item.key,
                  icon: item.icon,
                  label: item.label,
                  onClick: item.key === 'logout' ? handleLogout : undefined,
                  className: item.className,
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;