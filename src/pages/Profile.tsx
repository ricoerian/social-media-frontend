import React, { useEffect, useState, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Avatar,
  message,
  Modal,
  Spin,
  Flex,
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

interface ChangePasswordFormValues {
  old_password: string;
  new_password: string;
}

const Profile: React.FC = () => {
  const { user, fetchProfile } = useAuth();
  const [form] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<ChangePasswordFormValues>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false);
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

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    try {
      await API.put('/profile/password', values, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.success('Password berhasil diubah');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal mengubah password');
    }
  };

  // Fungsi untuk menonaktifkan akun
  const handleDeactivateAccount = async () => {
    try {
      await API.delete('/profile');
      message.success('Akun berhasil dinonaktifkan');
      // Setelah akun dinonaktifkan, Anda bisa melakukan logout atau redirect ke halaman login.
      // Contoh: window.location.href = '/login';
    } catch (error: unknown) {
      message.error((error as Error).message || 'Gagal menonaktifkan akun');
    }
    setIsDeactivateModalOpen(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Profile</h2>
      {user ? (
        <>
          <div className="flex flex-col items-center mb-8">
            {/* Avatar sebagai tombol upload */}
            <label htmlFor="fileUpload" className="cursor-pointer">
              <Avatar size={100} src={preview} className="cursor-pointer" />
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="!mt-2 text-gray-600">Click avatar to change photo</p>
          </div>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Fullname"
              name="fullname"
              rules={[{ required: true, max: 100, message: 'Masukkan fullname!' }]}
            >
              <Input placeholder="Masukkan fullname" />
            </Form.Item>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, min: 5, max: 50, message: 'Masukkan username!' }]}
            >
              <Input placeholder="Masukkan username" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, max: 100, type: 'email', message: 'Masukkan email valid!' },
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
              <Flex vertical gap={10}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={uploading}
                  className="text-lg"
                >
                  {uploading ? 'Updating Photo...' : 'Update Profile'}
                </Button>
                <Button
                  type="default"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-lg w-full !bg-red-500 !text-white hover:!text-white"
                >
                  Change Password
                </Button>
                <Button
                  type="default"
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="text-lg w-full !bg-red-600 !text-white hover:!text-white"
                >
                  Deactivate Account
                </Button>
              </Flex>
            </Form.Item>
          </Form>
          {/* Modal Change Password */}
          <Modal
            title="Change Password"
            open={isPasswordModalOpen}
            onCancel={() => setIsPasswordModalOpen(false)}
            footer={null}
          >
            <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword}>
              <Form.Item
                label="Old Password"
                name="old_password"
                rules={[{ required: true, message: 'Masukkan password lama!' }]}
              >
                <Input.Password placeholder="Masukkan password lama" />
              </Form.Item>
              <Form.Item
                label="New Password"
                name="new_password"
                rules={[
                  { required: true, message: 'Masukkan password baru!' },
                  { min: 6, message: 'Password minimal 6 karakter!' },
                ]}
              >
                <Input.Password placeholder="Masukkan password baru" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="default"
                  className="!bg-red-500 !text-white hover:!text-white"
                  htmlType="submit"
                  block
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          {/* Modal Deactivate Account */}
          <Modal
            title="Deactivate Account"
            open={isDeactivateModalOpen}
            onCancel={() => setIsDeactivateModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsDeactivateModalOpen(false)}>
                Cancel
              </Button>,
              <Button
                key="confirm"
                type="primary"
                danger
                onClick={handleDeactivateAccount}
              >
                Deactivate
              </Button>,
            ]}
          >
            <p>
              Are you sure you want to deactivate your account? This action cannot be undone.
            </p>
          </Modal>
        </>
      ) : (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      )}
    </div>
  );
};

export default Profile;