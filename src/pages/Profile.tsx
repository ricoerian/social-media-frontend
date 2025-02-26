import React, { useEffect, useState, useCallback, useMemo } from 'react'; 
import { Form, Input, Button, message, Select, DatePicker } from 'antd';
import moment from 'moment';
import API from '../api';
import { useAuth } from '../hooks/useAuth';

// Definisi tipe untuk user agar lebih aman
interface UserProfile {
  Fullname?: string;
  Username?: string;
  Email?: string;
  JenisKelamin?: string;
  TanggalLahir?: string;
  PhotoProfile?: string;
}

const Profile: React.FC = () => {
  const { user, fetchProfile } = useAuth();
  const [form] = Form.useForm();
  const [preview, setPreview] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_GOLANG_API_BASE_URL;

  // Menggunakan useMemo agar tidak dihitung ulang di setiap render
  const defaultProfileImage = useMemo(() => `${baseUrl}/public/default/user.png`, [baseUrl]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        Fullname: user.Fullname ?? '',
        Username: user.Username ?? '',
        Email: user.Email ?? '',
        JenisKelamin: user.JenisKelamin ?? '',
        TanggalLahir: user.TanggalLahir ? moment(user.TanggalLahir) : undefined,
      });

      setPreview(user.PhotoProfile ? `${baseUrl}/${user.PhotoProfile}` : defaultProfileImage);
    }
  }, [user, form, baseUrl, defaultProfileImage]);

  // Fungsi untuk menangani perubahan gambar
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append('photo_profile', file);

      try {
        await API.put('/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        message.success('Foto profil berhasil diperbarui');
        fetchProfile();
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message || 'Gagal update foto profil');
        }
      }
    },
    [fetchProfile]
  );

  // Fungsi submit form
  const onFinish = async (values: UserProfile) => {
    const formData = new FormData();
    formData.append('Fullname', values.Fullname ?? '');
    formData.append('Username', values.Username ?? '');
    formData.append('Email', values.Email ?? '');
    
    if (values.JenisKelamin) {
      formData.append('JenisKelamin', values.JenisKelamin);
    }

    if (values.TanggalLahir) {
      formData.append('TanggalLahir', moment(values.TanggalLahir).format('YYYY-MM-DD'));
    }

    try {
      await API.put('/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Profile berhasil diperbarui');
      fetchProfile();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || 'Gagal update profile');
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-3xl text-center font-bold !mb-8">Profile</h2>
      {user ? (
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <div className="flex flex-col items-center my-2">
            <label htmlFor="fileUpload" className="flex flex-col items-center cursor-pointer text-blue-500 text-sm">
              <img
                src={preview ?? defaultProfileImage}
                alt="Profile"
                className="rounded-full w-32 h-32 object-cover cursor-pointer shadow-lg"
              />
              <p className="text-lg !mt-2 text-gray-600">Click avatar to change photo</p>
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <Form.Item key="fullname" label="Fullname" name="Fullname" rules={[{ required: true, message: 'Masukkan Fullname!' }]}> 
            <Input placeholder="Masukkan Fullname" />
          </Form.Item>
          <Form.Item key="username" label="Username" name="Username" rules={[{ required: true, message: 'Masukkan Username!' }]}> 
            <Input placeholder="Masukkan Username" />
          </Form.Item>
          <Form.Item key="email" label="Email" name="Email" rules={[{ required: true, type: 'email', message: 'Masukkan Email valid!' }]}> 
            <Input placeholder="Masukkan Email" />
          </Form.Item>
          <Form.Item key="jenisKelamin" label="Jenis Kelamin" name="JenisKelamin">
            <Select placeholder="Pilih jenis kelamin">
              <Select.Option value="Man">Man</Select.Option>
              <Select.Option value="Woman">Woman</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item key="tanggalLahir" label="Tanggal Lahir" name="TanggalLahir">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item key="submit">
            <Button type="primary" htmlType="submit" block>Update Profile</Button>
          </Form.Item>
        </Form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
