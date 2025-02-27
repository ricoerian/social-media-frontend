import React from 'react';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { Moment } from 'moment';

interface RegisterFormValues {
  fullname: string;
  username: string;
  email: string;
  password: string;
  jenis_kelamin: string;
  tanggal_lahir: Moment;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    // Konversi tanggal lahir ke string dengan format "YYYY-MM-DD"
    const payload = {
      fullname: values.fullname,
      username: values.username,
      email: values.email,
      password: values.password,
      jenis_kelamin: values.jenis_kelamin,
      tanggal_lahir: values.tanggal_lahir ? values.tanggal_lahir.format("YYYY-MM-DD") : null,
    };

    try {
      await API.post('/register', payload);
      message.success('Registrasi berhasil, silakan login');
      navigate('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      if (err.response?.data?.error) {
        message.error(err.response.data.error);
      } else {
        message.error('Registrasi gagal');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">FeedsApp</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Fullname"
            name="fullname"
            rules={[{ required: true, message: 'Masukkan fullname!' }]}
          >
            <Input placeholder="Masukkan fullname" />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Masukkan username!' }]}
          >
            <Input placeholder="Masukkan username" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Masukkan email valid!' }]}
          >
            <Input placeholder="Masukkan email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6, message: 'Password minimal 6 karakter!' }]}
          >
            <Input.Password placeholder="Masukkan password" />
          </Form.Item>
          <Form.Item
            label="Jenis Kelamin"
            name="jenis_kelamin"
            rules={[{ required: true, message: 'Pilih jenis kelamin!' }]}
          >
            <Select placeholder="Pilih jenis kelamin">
              <Select.Option value="Man">Man</Select.Option>
              <Select.Option value="Woman">Woman</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Tanggal Lahir"
            name="tanggal_lahir"
            rules={[{ required: true, message: 'Masukkan tanggal lahir!' }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-green-600 hover:bg-green-700"
            >
              Register
            </Button>
          </Form.Item>
          <p className="text-center">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-green-600 hover:underline">
              Login di sini
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Register;
