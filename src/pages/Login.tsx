import React from 'react';
import { Form, Input, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useToast } from '../components/ToastContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast()

  const onFinish = async (values: { login: string; password: string }) => {
    try {
      const res = await API.post('/login', values);
      localStorage.setItem('token', res.data.token);
      showToast('Login berhasil', 'success');
      navigate('/');
    } catch (error: unknown) {
      if (error instanceof Error && (error as { response?: { data?: { error?: string } } }).response) {
        const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login gagal';
        showToast(errorMessage, 'danger');
      } else {
        showToast('Login gagal', 'danger');
      }
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center px-4 rounded-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-3xl !font-bold mb-6 text-center text-blue-500">FeedsApp</h2>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email atau Username"
              name="login"
              rules={[{ required: true, message: 'Masukkan email atau username!' }]}
            >
              <Input placeholder="Masukkan email atau username" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Masukkan password!' }]}
            >
              <Input.Password placeholder="Masukkan password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block className="bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            </Form.Item>
            <p className="text-center">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register di sini
              </Link>
            </p>
          </Form>
        </div>
      </div>
  );
};

export default Login;
