import { useState, useEffect } from 'react';
import API from '../api';

export interface User {
  ID: number;
  Fullname: string;
  Username: string;
  Email: string;
  PhotoProfile: string;
  JenisKelamin: string;
  TanggalLahir: string;
  // tambahkan field lain jika perlu
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile');
      setUser(res.data.user);
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { user, setUser, fetchProfile };
};
