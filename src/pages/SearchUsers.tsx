import React, { useState, useEffect } from 'react';
import { Input, List, Avatar } from 'antd';
import { Link } from 'react-router-dom';
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
  const baseUrl = import.meta.env.VITE_GOLANG_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users');
        setUsers(res.data.users);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
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
          <Link to={`/user/${user.ID}`}>
            <List.Item>
                <List.Item.Meta
                avatar={
                    <Avatar src={user.PhotoProfile ? `${baseUrl}/${user.PhotoProfile}` : undefined}>
                    {user.Fullname.charAt(0)}
                    </Avatar>
                }
                title={user.Fullname}
                description={user.Username}
                />
            </List.Item>
          </Link>
        )}
      />
    </div>
  );
};

export default SearchUsers;