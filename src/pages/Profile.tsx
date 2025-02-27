import React, { useEffect, useState, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Avatar,
  message,
} from 'antd';
import moment, { Moment } from 'moment';
import API from '../api';
import { useAuth } from '../hooks/useAuth';

interface ProfileFormValues {
  fullname: string;
  username: string;
  email: string;
  jenis_kelamin?: string;
  tanggal_lahir?: Moment;
}

const Profile: React.FC = () => {
  const { user, fetchProfile } = useAuth();
  const [form] = Form.useForm<ProfileFormValues>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>('');
  
  // Base URL dari variabel lingkungan Vite
  const baseUrl = import.meta.env.VITE_GOLANG_API_BASE_URL;
  const defaultProfileImage = `${baseUrl}/public/default/user.png`;

  // Saat data user tersedia, inisialisasi form dan preview image
  useEffect(() => {
    if (user) {
      const tanggalLahirValue = user.TanggalLahir
        ? moment(user.TanggalLahir, 'YYYY-MM-DD')
        : undefined;
      form.setFieldsValue({
        fullname: user.Fullname || '',
        username: user.Username || '',
        email: user.Email || '',
        jenis_kelamin: user.JenisKelamin || '',
        tanggal_lahir: tanggalLahirValue,
      });
      setPreview(
        user.PhotoProfile
          ? `${baseUrl}/${user.PhotoProfile}`
          : defaultProfileImage
      );
    }
  }, [user, form, baseUrl, defaultProfileImage]);

  // Fungsi untuk mengupload photo profile langsung saat file dipilih
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append('photo_profile', file);
      setUploading(true);
      try {
        await API.put('/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Foto profil berhasil diperbarui');
        fetchProfile();
      } catch (error: unknown) {
        message.error((error as Error).message || 'Gagal update foto profil');
      }
      setUploading(false);
    },
    [fetchProfile]
  );

  // Fungsi untuk update data profile (selain photo)
  const onFinish = async (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('fullname', values.fullname);
    formData.append('username', values.username);
    formData.append('email', values.email);
    if (values.jenis_kelamin) {
      formData.append('jenis_kelamin', values.jenis_kelamin);
    }
    if (values.tanggal_lahir) {
      formData.append('tanggal_lahir', values.tanggal_lahir.format('YYYY-MM-DD'));
    }
    try {
      await API.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Profile berhasil diperbarui');
      fetchProfile();
    } catch (error: unknown) {
      message.error((error as Error).message || 'Gagal update profile');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Profile</h2>
      {user ? (
        <>
          <div className="flex flex-col items-center mb-8">
            {/* Avatar sebagai tombol upload */}
            <label htmlFor="fileUpload" className="cursor-pointer">
              <Avatar
                size={100}
                src={preview}
                className="cursor-pointer"
              />
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-gray-600">Click avatar to change photo</p>
          </div>
          <Form layout="vertical" form={form} onFinish={onFinish}>
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
              rules={[
                { required: true, type: 'email', message: 'Masukkan email valid!' },
              ]}
            >
              <Input placeholder="Masukkan email" />
            </Form.Item>
            <Form.Item label="Jenis Kelamin" name="jenis_kelamin">
              <Select placeholder="Pilih jenis kelamin">
                <Select.Option value="Man">Man</Select.Option>
                <Select.Option value="Woman">Woman</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Tanggal Lahir" name="tanggal_lahir">
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block disabled={uploading} className="text-lg">
                {uploading ? 'Updating Photo...' : 'Update Profile'}
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
};

export default Profile;
