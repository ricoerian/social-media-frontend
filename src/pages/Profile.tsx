import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Form, Input, Button, message, Select, DatePicker } from 'antd';
import moment from 'moment';
import API from '../api';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  Fullname?: string;
  Username?: string;
  Email?: string;
  JenisKelamin?: string;
  TanggalLahir?: moment.Moment;
  PhotoProfile?: string;
}

const Profile: React.FC = () => {
  const { user, fetchProfile } = useAuth();
  const [form] = Form.useForm();
  const [preview, setPreview] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_GOLANG_API_BASE_URL;

  // Gambar default jika belum ada PhotoProfile
  const defaultProfileImage = useMemo(() => `${baseUrl}/public/default/user.png`, [baseUrl]);

  useEffect(() => {
    if (user) {
      // Pastikan user.TanggalLahir adalah string tanggal yang valid (misalnya "2020-01-01")
      form.setFieldsValue({
        Fullname: user.Fullname || '',
        Username: user.Username || '',
        Email: user.Email || '',
        JenisKelamin: user.JenisKelamin || '',
        // Jika TanggalLahir ada dan valid, ubah menjadi moment; jika tidak, set ke null
        TanggalLahir: user.TanggalLahir ? moment(user.TanggalLahir) : null,
      });
      setPreview(user.PhotoProfile ? `${baseUrl}/${user.PhotoProfile}` : defaultProfileImage);
    }
  }, [user, form, baseUrl, defaultProfileImage]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append('photo_profile', file);

      try {
        await API.put('/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Foto profil berhasil diperbarui');
        fetchProfile();
      } catch (error: unknown) {
        message.error((error as Error).message || 'Gagal update foto profil');
      }
    },
    [fetchProfile]
  );

  const onFinish = async (values: UserProfile) => {
    // Debug: cek nilai TanggalLahir
    console.log('TanggalLahir dari form:', values.TanggalLahir);
    
    const formData = new FormData();
    // Gunakan key yang sesuai dengan backend
    formData.append('fullname', values.Fullname || '');
    formData.append('username', values.Username || '');
    formData.append('email', values.Email || '');
    if (values.JenisKelamin) {
      formData.append('jenis_kelamin', values.JenisKelamin);
    }
    if (values.TanggalLahir) {
      // values.TanggalLahir seharusnya merupakan moment object
      formData.append('tanggal_lahir', values.TanggalLahir.format('YYYY-MM-DD'));
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
    <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-3xl text-center font-bold mb-8">Profile</h2>
      {user ? (
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <div className="flex flex-col items-center my-2">
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center cursor-pointer text-blue-500 text-sm"
            >
              <img
                src={preview || defaultProfileImage}
                alt="Profile"
                className="rounded-full w-32 h-32 object-cover cursor-pointer shadow-lg"
              />
              <p className="text-lg mt-2 text-gray-600">Click avatar to change photo</p>
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
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
            rules={[{ required: true, type: 'email', message: 'Masukkan Email valid!' }]}
          >
            <Input placeholder="Masukkan Email" />
          </Form.Item>
          <Form.Item label="Jenis Kelamin" name="JenisKelamin">
            <Select placeholder="Pilih jenis kelamin">
              <Select.Option value="Man">Man</Select.Option>
              <Select.Option value="Woman">Woman</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Tanggal Lahir" name="TanggalLahir">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
