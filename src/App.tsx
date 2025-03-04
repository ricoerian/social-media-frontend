import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feeds from './pages/Feeds';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import SearchUsers from './pages/SearchUsers';
import UserDetail from './pages/UserDetail';
import Layout from './components/Layout';
import { ToastProvider } from './components/ToastContext';

// Komponen RequireAuth untuk proteksi route
const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  // Cek apakah token ada di localStorage atau dari hook useAuth
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Route Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout>
                  <Feeds />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <Layout>
                  <Chat />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Layout>
                  <Profile />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <Layout>
                  <SearchUsers />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/user/:id"
            element={
              <RequireAuth>
                <Layout>
                  <UserDetail />
                </Layout>
              </RequireAuth>
            }
          />

          {/* Catch-all Redirect ke Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;