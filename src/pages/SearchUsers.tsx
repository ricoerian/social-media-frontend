import React, { useState, useEffect } from 'react';
import { Input, List, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { CheckCircleTwoTone } from '@ant-design/icons';
import API from '../api';

interface IUser {
  ID: number;
  Username: string;
  Fullname: string;
  PhotoProfile?: string;
}

const SearchUsers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const baseUrl = import.meta.env.VITE_GOLANG_API_BASE_URL;

  useEffect(() => {
    // Fetch user yang sedang login
    const fetchCurrentUser = async () => {
      try {
        const res = await API.get('/profile');
        setCurrentUserId(res.data.user.ID);
      } catch (error) {
        console.error('Error fetching current user', error);
      }
    };

    // Fetch semua users
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users');
        setUsers(res.data.users);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Filter users: Tidak menampilkan user yang sedang login
  const filteredUsers = users
    .filter(user => user.ID !== currentUserId)
    .filter(user =>
      user.Fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="max-w-lg mx-auto p-4">
      <Input.Search
        placeholder="Cari user..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        enterButton
      />
      <List
        itemLayout="horizontal"
        dataSource={filteredUsers}
        renderItem={user => (
          <Link to={`/user/${user.ID}`} key={user.ID}>
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={user.PhotoProfile ? `${baseUrl}/${user.PhotoProfile}` : undefined}>
                    {user.Fullname.charAt(0)}
                  </Avatar>
                }
                title={
                  <span className="!break-all">
                    {user.Fullname}
                    {user.ID === 1 && (
                      <CheckCircleTwoTone style={{ marginLeft: 4 }} />
                    )}
                  </span>
                }
                description={`@${user.Username}`}
              />
            </List.Item>
          </Link>
        )}
      />
    </div>
  );
};

export default SearchUsers;
