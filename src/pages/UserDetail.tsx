// src/pages/UserDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Button, List, message } from 'antd';
import API from '../api';

interface IUser {
  ID: number;
  Username: string;
  Fullname: string;
  PhotoProfile?: string;
}

interface IFeed {
  ID: number;
  Feed: string;
  File: string;
  UserID: number;
  CreatedAt: string;
}

interface RouteParams {
  id: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams() as unknown as RouteParams;
  const userId = parseInt(id, 10);
  const [userDetail, setUserDetail] = useState<IUser | null>(null);
  const [feeds, setFeeds] = useState<IFeed[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const baseUrl = import.meta.env.VITE_GOLANG_API_BASE_URL;

  // Ambil detail user dari endpoint /users (asumsi endpoint ini mengembalikan semua user)
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await API.get('/users');
        const users: IUser[] = res.data.users;
        const foundUser = users.find(u => u.ID === userId);
        if (foundUser) {
          setUserDetail(foundUser);
        }
      } catch (error) {
        console.error('Error fetching user detail', error);
      }
    };
    fetchUserDetail();
  }, [userId]);

  // Ambil semua feed lalu filter feed yang dibuat oleh user tersebut
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await API.get('/feeds');
        const allFeeds: IFeed[] = res.data.feeds;
        const userFeeds = allFeeds.filter(feed => feed.UserID === userId);
        setFeeds(userFeeds);
      } catch (error) {
        console.error('Error fetching feeds', error);
      }
    };
    fetchFeeds();
  }, [userId]);

  // Cek apakah current user sudah mengikuti user target
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await API.get('/following');
        const following: IUser[] = res.data.following;
        const isFollow = following.some(u => u.ID === userId);
        setIsFollowing(isFollow);
      } catch (error) {
        console.error('Error fetching following', error);
      }
    };
    fetchFollowing();
  }, [userId]);

  const handleFollow = async () => {
    try {
      await API.post(`/follow/${userId}`);
      message.success('Berhasil mengikuti user');
      setIsFollowing(true);
    } catch {
      message.error('Gagal mengikuti user');
    }
  };

  const handleUnfollow = async () => {
    try {
      await API.delete(`/follow/${userId}`);
      message.success('Berhasil berhenti mengikuti user');
      setIsFollowing(false);
    } catch {
      message.error('Gagal berhenti mengikuti user');
    }
  };

  if (!userDetail) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar
          size={80}
          src={userDetail.PhotoProfile ? `${baseUrl}/${userDetail.PhotoProfile}` : undefined}
        >
          {userDetail.Fullname.charAt(0)}
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{userDetail.Fullname}</h2>
          <p className="text-gray-500">@{userDetail.Username}</p>
        </div>
        <div className="ml-auto">
          {isFollowing ? (
            <Button type="primary" danger onClick={handleUnfollow}>
              Followed
            </Button>
          ) : (
            <Button type="primary" onClick={handleFollow}>
              Follow
            </Button>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Feeds</h3>
        {feeds.length > 0 ? (
          <List
            dataSource={feeds}
            renderItem={(feed) => (
              <List.Item key={feed.ID} className="mb-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full p-4">
                  <p className="text-sm mb-2">{feed.Feed}</p>
                  {feed.File && (
                    <div className="w-full">
                      {(() => {
                        const fileUrl = `${baseUrl}/${feed.File}`;
                        const ext = feed.File.split('.').pop()?.toLowerCase();
                        const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
                        const videoExt = ['mp4', 'mov', 'avi', 'mkv'];
                        const audioExt = ['mp3', 'wav', 'ogg'];
                        if (ext && imageExt.includes(ext)) {
                          return (
                            <img
                              src={fileUrl}
                              alt="attachment"
                              className="object-cover rounded w-full max-h-80"
                            />
                          );
                        } else if (ext && videoExt.includes(ext)) {
                          return (
                            <video
                              controls
                              src={fileUrl}
                              className="object-cover rounded w-full max-h-80"
                            />
                          );
                        } else if (ext && audioExt.includes(ext)) {
                          return <audio controls src={fileUrl} className="w-full" />;
                        } else {
                          return (
                            <a href={fileUrl} download className="text-blue-500 underline">
                              Download File
                            </a>
                          );
                        }
                      })()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(feed.CreatedAt).toLocaleString()}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <p>User ini belum membuat feed.</p>
        )}
      </div>
    </div>
  );
};

export default UserDetail;