import React, { useEffect, useState } from 'react';
import {
  List,
  Button,
  Modal,
  message,
  Form,
  Input,
  Upload,
  UploadFile,
  Avatar,
  Carousel,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import API from '../api';
import { useAuth } from '../hooks/useAuth';

interface FeedUser {
  ID: number;
  Fullname: string;
  Username: string;
  Email: string;
  PhotoProfile: string;
}

interface CommentItem {
  ID: number;
  Comment: string;
  FeedID: number;
  User: FeedUser;
  CreatedAt: string;
}

interface ReactionItem {
  ID: number;
  FeedID: number;
  Reaction: string;
  UserID: number;
  User: FeedUser;
  CreatedAt: string;
}

interface FeedItem {
  ID: number;
  Feed: string;
  File: string;
  UserID: number;
  User?: FeedUser;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  Comments?: CommentItem[];
  Reactions?: ReactionItem[];
}

interface CreateFeedFormValues {
  feed: string;
}

// Helper untuk mendapatkan inisial nama
const getInitials = (name: string): string => {
  const words = name.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
};

// Fungsi helper untuk merender media berdasarkan ekstensi file
const renderMedia = (filePath: string): React.ReactNode => {
  const url = `${import.meta.env.VITE_GOLANG_API_BASE_URL}/${filePath}`;
  const extension = filePath.split('.').pop()?.toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
  const audioExtensions = ['mp3', 'wav', 'ogg'];

  if (!extension) {
    return (
      <a href={url} download className="text-blue-500 underline">
        Download File
      </a>
    );
  }
  if (imageExtensions.includes(extension)) {
    return (
      <img
        src={url}
        alt="Feed media"
        className="w-full h-full object-cover rounded"
      />
    );
  } else if (videoExtensions.includes(extension)) {
    return (
      <video controls className="w-full h-full object-cover rounded" src={url} />
    );
  } else if (audioExtensions.includes(extension)) {
    return <audio controls className="w-full" src={url} />;
  } else {
    return (
      <a href={url} download className="text-blue-500 ml-4 underline block">
        {filePath.replace('public/uploads/', '')}
      </a>
    );
  }
};

const Feeds: React.FC = () => {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<CreateFeedFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [commentValues, setCommentValues] = useState<{ [key: number]: string }>({});

  // State untuk edit feed
  const [editingFeed, setEditingFeed] = useState<FeedItem | null>(null);
  const [isEditFeedModalVisible, setIsEditFeedModalVisible] = useState<boolean>(false);

  // State untuk edit komentar (mapping: commentID -> new text)
  const [editingComments, setEditingComments] = useState<{
    [commentId: number]: string;
  }>({});

  // Ambil feed dari backend
  const fetchFeeds = async (): Promise<void> => {
    try {
      const res = await API.get('/feeds');
      setFeeds(res.data.feeds);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleCreateFeed = async (values: CreateFeedFormValues): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('feed', values.feed);
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('file', file.originFileObj);
        }
      });
      await API.post('/feeds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Feed berhasil dibuat');
      form.resetFields();
      setFileList([]);
      setPreviewUrls([]);
      setIsModalVisible(false);
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal membuat feed');
    }
  };

  const handleLike = async (feedID: number): Promise<void> => {
    try {
      await API.post(`/feeds/${feedID}/like`);
      message.success('Feed dilike');
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal meng-like feed');
    }
  };

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
    const urls = fileList
      .filter((file) => file.originFileObj)
      .map(
        (file) =>
          file.originFileObj && (URL.createObjectURL(file.originFileObj) as string)
      );
    setPreviewUrls(urls.filter((url): url is string => !!url));
  };

  const handleSubmitComment = async (feedId: number) => {
    const comment = commentValues[feedId];
    if (!comment || comment.trim() === '') {
      message.error('Komentar tidak boleh kosong');
      return;
    }
    try {
      const userData = user
        ? {
            ID: user.ID,
            Fullname: user.Fullname,
            Username: user.Username,
            Email: user.Email,
            PhotoProfile: user.PhotoProfile,
          }
        : null;
      await API.post(`/feeds/${feedId}/comments`, { comment, user: userData });
      message.success('Komentar berhasil dikirim');
      setCommentValues((prev) => ({ ...prev, [feedId]: '' }));
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal mengirim komentar');
    }
  };

  // --- Fitur Edit & Hapus Feed ---
  const openEditFeedModal = (feed: FeedItem) => {
    setEditingFeed(feed);
    setIsEditFeedModalVisible(true);
  };

  const handleUpdateFeed = async () => {
    if (!editingFeed) return;
    try {
      await API.put(`/feeds/${editingFeed.ID}`, { feed: editingFeed.Feed });
      message.success('Feed berhasil diupdate');
      setEditingFeed(null);
      setIsEditFeedModalVisible(false);
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal mengupdate feed');
    }
  };

  const handleDeleteFeed = async (feedID: number) => {
    try {
      await API.delete(`/feeds/${feedID}`);
      message.success('Feed berhasil dihapus');
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal menghapus feed');
    }
  };

  // --- Fitur Edit & Hapus Komentar ---
  const startEditComment = (comment: CommentItem) => {
    setEditingComments((prev) => ({ ...prev, [comment.ID]: comment.Comment }));
  };

  const cancelEditComment = (commentID: number) => {
    setEditingComments((prev) => {
      const newState = { ...prev };
      delete newState[commentID];
      return newState;
    });
  };

  const handleUpdateComment = async (commentID: number) => {
    try {
      await API.put(`/comments/${commentID}`, {
        comment: editingComments[commentID],
      });
      message.success('Komentar berhasil diupdate');
      cancelEditComment(commentID);
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal mengupdate komentar');
    }
  };

  const handleDeleteComment = async (commentID: number) => {
    try {
      await API.delete(`/comments/${commentID}`);
      message.success('Komentar berhasil dihapus');
      fetchFeeds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Gagal menghapus komentar');
    }
  };

  return (
    <div className="container mx-auto">
      {/* Modal Pembuatan Feed */}
      <Modal
        title="Buat Feed Baru"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
          setPreviewUrls([]);
        }}
        footer={null}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateFeed}>
          <Form.Item
            name="feed"
            label="Isi Feed"
            rules={[{ required: true, message: 'Isi feed tidak boleh kosong' }]}
          >
            <Input.TextArea rows={4} placeholder="Tulis feed anda di sini..." />
          </Form.Item>
          <Form.Item name="file" label="File (opsional)">
            <Upload
              multiple
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleFileChange}
              onRemove={(file) => {
                const newFileList = fileList.filter((f) => f.uid !== file.uid);
                setFileList(newFileList);
                const newPreviewUrls = newFileList
                  .filter((f) => f.originFileObj)
                  .map((f) => f.originFileObj && URL.createObjectURL(f.originFileObj))
                  .filter((url): url is string => !!url);
                setPreviewUrls(newPreviewUrls);
              }}
            >
              <Button icon={<UploadOutlined />}>Pilih File</Button>
            </Upload>
            {previewUrls.length > 0 && (
              <div className="mt-4">
                {previewUrls.length === 1 ? (
                  <div>{renderMedia(previewUrls[0].split('/').pop()!)}</div>
                ) : (
                  <Carousel dotPosition="bottom" draggable adaptiveHeight>
                    {previewUrls.map((url, index) => (
                      <div key={index}>{renderMedia(url.split('/').pop()!)}</div>
                    ))}
                  </Carousel>
                )}
              </div>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Post Feed
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Edit Feed */}
      <Modal
        title="Edit Feed"
        visible={isEditFeedModalVisible}
        onCancel={() => {
          setIsEditFeedModalVisible(false);
          setEditingFeed(null);
        }}
        onOk={handleUpdateFeed}
      >
        <Input.TextArea
          rows={4}
          value={editingFeed?.Feed}
          onChange={(e) =>
            editingFeed &&
            setEditingFeed({ ...editingFeed, Feed: e.target.value })
          }
          className="break-all"
        />
      </Modal>

      {/* Floating Button untuk membuat feed */}
      {user && (
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          className="!fixed bottom-16 right-4 md:bottom-4 z-50 shadow-lg"
          onClick={() => setIsModalVisible(true)}
        />
      )}

      {/* List Feed */}
      <List
        dataSource={feeds}
        renderItem={(item: FeedItem) => {
          const filePaths = item.File ? item.File.split(',').filter((path) => path) : [];
          const isLiked =
            user &&
            item.Reactions?.some(
              (reaction) => reaction.Reaction === 'like' && reaction.UserID === user.ID
            );
          const likeCount = item.Reactions ? item.Reactions.length : 0;
          return (
            <List.Item key={item.ID} className="mb-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full md:w-3/4 lg:w-2/3 mx-auto">
                {/* Header */}
                <div className="flex items-center p-4 justify-between">
                  <div className="flex items-center">
                    <Avatar
                      shape="circle"
                      size={40}
                      className='!object-cover'
                      style={{ objectFit: 'cover' }}
                      src={
                        item.User && item.User.PhotoProfile
                          ? `${import.meta.env.VITE_GOLANG_API_BASE_URL}/${item.User.PhotoProfile}`
                          : undefined
                      }
                    >
                      {item.User
                        ? getInitials(item.User.Fullname || item.User.Username)
                        : 'U'}
                    </Avatar>
                    <div className="ml-4 overflow-hidden">
                      <p className="font-semibold text-sm break-all">
                        {item.User ? item.User.Fullname : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        {new Date(item.CreatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Tombol edit & hapus feed (hanya pemilik feed) */}
                  {user && item.User?.ID === user.ID && (
                    <div>
                      <Button type="link" onClick={() => openEditFeedModal(item)}>
                        Edit
                      </Button>
                      <Button type="link" danger onClick={() => handleDeleteFeed(item.ID)}>
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>
                {/* Konten Post */}
                {filePaths.length > 0 && (
                  <div className="w-full">
                    {filePaths.length === 1 ? (
                      renderMedia(filePaths[0])
                    ) : (
                      <Carousel dotPosition="bottom" draggable adaptiveHeight>
                        {filePaths.map((filePath, idx) => (
                          <div key={idx}>{renderMedia(filePath)}</div>
                        ))}
                      </Carousel>
                    )}
                  </div>
                )}
                {/* Footer/Aksi */}
                <div className="p-4">
                  <p className="text-sm mb-2 break-all">{item.Feed}</p>
                  <div className="flex items-center space-x-4">
                    <Button type="text" onClick={() => handleLike(item.ID)}>
                      {isLiked ? (
                        <HeartFilled className="text-red-500" />
                      ) : (
                        <HeartOutlined />
                      )}
                      <span className="ml-1 text-sm">{likeCount}</span>
                    </Button>
                  </div>
                  {/* Form Komentar */}
                  {user && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Input
                        placeholder="Tulis komentar..."
                        value={commentValues[item.ID] || ''}
                        onChange={(e) =>
                          setCommentValues((prev) => ({
                            ...prev,
                            [item.ID]: e.target.value,
                          }))
                        }
                        onPressEnter={() => handleSubmitComment(item.ID)}
                      />
                      <Button type="primary" onClick={() => handleSubmitComment(item.ID)}>
                        Kirim Komentar
                      </Button>
                    </div>
                  )}
                  {/* Tampilkan Komentar jika ada */}
                  {item.Comments && item.Comments.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      {item.Comments.map((comment) => {
                        const commentUser =
                          comment.User && comment.User.Username.trim() !== ''
                            ? comment.User
                            : {
                                ID: 0,
                                Username: 'Unknown',
                                PhotoProfile: '',
                                Fullname: '',
                              };
                        return (
                          <div key={comment.ID} className="flex flex-col mt-2">
                            <div className="flex items-start">
                              {/* PERUBAHAN: Style agar avatar komentar tidak gepeng */}
                              <Avatar
                                shape="circle"
                                size={30}
                                style={{ objectFit: 'cover' }} // PERUBAHAN
                                src={
                                  commentUser.PhotoProfile
                                    ? `${import.meta.env.VITE_GOLANG_API_BASE_URL}/${commentUser.PhotoProfile}`
                                    : undefined
                                }
                              >
                                {getInitials(
                                  commentUser.Fullname || commentUser.Username
                                )}
                              </Avatar>
                              <div className="ml-2 overflow-hidden">
                                <p className="text-sm font-semibold break-all">
                                  {commentUser.Fullname || 'Unknown'}{' '}
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(comment.CreatedAt).toLocaleString()}
                                  </span>
                                </p>
                                {/* Jika sedang dalam mode edit komentar */}
                                {Object.prototype.hasOwnProperty.call(
                                  editingComments,
                                  comment.ID
                                ) ? (
                                  <div className="!w-full flex items-center gap-2">
                                    <Input
                                      value={editingComments[comment.ID]}
                                      onChange={(e) =>
                                        setEditingComments((prev) => ({
                                          ...prev,
                                          [comment.ID]: e.target.value,
                                        }))
                                      }
                                      className="break-all"
                                    />
                                    <Button onClick={() => handleUpdateComment(comment.ID)}>
                                      Simpan
                                    </Button>
                                    <Button
                                      onClick={() => cancelEditComment(comment.ID)}
                                      danger
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="text-sm break-all">{comment.Comment}</p>
                                )}
                              </div>
                              {/* Tombol edit & hapus komentar */}
                              <div className="ml-2">
                                {user &&
                                  commentUser.ID === user.ID &&
                                  !Object.prototype.hasOwnProperty.call(
                                    editingComments,
                                    comment.ID
                                  ) && (
                                    <Button
                                      type="link"
                                      onClick={() => startEditComment(comment)}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                {user && commentUser.ID === user.ID && (
                                  <Button
                                    type="link"
                                    danger
                                    onClick={() => handleDeleteComment(comment.ID)}
                                  >
                                    Hapus
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default Feeds;