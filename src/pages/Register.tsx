import React from 'react';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import moment from 'moment';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: { Fullname: string; Username: string; Email: string; Password: string; JenisKelamin: string; TanggalLahir: moment.Moment }) => {
    // Konversi tanggal lahir dari moment ke string dengan format "YYYY-MM-DD"
    const payload = {
      ...values,
      TanggalLahir: values.TanggalLahir ? values.TanggalLahir.format("YYYY-MM-DD") : null,
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
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center px-4 rounded-2xl">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <h2 className="text-3xl !font-bold mb-6 text-center text-blue-500">FeedsApp</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Fullname"
            name="Fullname"
            rules={[{ required: true, message: 'Masukkan Fullname!' }]}
          >
            <Input placeholder="Masukkan Fullname" />
          </Form.Item>
          <Form.Item
            label="Username"
            name="Username"
            rules={[{ required: true, message: 'Masukkan Username!' }]}
          >
            <Input placeholder="Masukkan Username" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="Email"
            rules={[
              { required: true, type: 'email', message: 'Masukkan Email valid!' },
            ]}
          >
            <Input placeholder="Masukkan Email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="Password"
            rules={[{ required: true, min: 6, message: 'Password minimal 6 karakter!' }]}
          >
            <Input.Password placeholder="Masukkan Password" />
          </Form.Item>
          <Form.Item
            label="Jenis Kelamin"
            name="JenisKelamin"
            rules={[{ required: true, message: 'Pilih jenis kelamin!' }]}
          >
            <Select placeholder="Pilih jenis kelamin">
              <Select.Option value="Man">Man</Select.Option>
              <Select.Option value="Woman">Woman</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Tanggal Lahir"
            name="TanggalLahir"
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
