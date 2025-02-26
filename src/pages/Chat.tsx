import React, { useEffect, useRef, useState } from 'react';
import {
  List,
  Button,
  Modal,
  Input,
  Form,
  Select,
  message,
  Avatar,
  Grid,
  Flex,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import API from '../api';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const { useBreakpoint } = Grid;

interface IUser {
  ID: number;
  Username: string;
  Fullname: string;
}

interface IChatroom {
  ID: number;
  Name: string;
  IsGroup: boolean;
  OwnerID: number;
}

interface IMessageItem {
  ID: number;
  Message: string;
  CreatedAt: string;
  User: {
    ID: number;
    Username: string;
    Fullname?: string;
  };
}

// Helper: generate inisial dari nama
const getInitials = (name: string): string => {
  const words = name.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
};

//
// Komponen Chat untuk Mobile
//
interface MobileChatProps {
  messages: IMessageItem[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: () => void;
  selectedChatroom: IChatroom | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  user: IUser | null;
  onBack: () => void;
}

export const MobileChat: React.FC<MobileChatProps> = React.memo(({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  selectedChatroom,
  messagesEndRef,
  user,
  onBack,
}) => (
  <div className="w-full h-[650px] flex flex-col bg-white rounded-2xl mb-10 shadow-lg">
    <header className="flex items-center p-4 border-b">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="mr-2"
      />
      <h3 className="text-lg font-semibold text-gray-800">
        {selectedChatroom
          ? selectedChatroom.Name ||
            (selectedChatroom.IsGroup ? 'Group Chat' : 'Direct Chat')
          : 'Chat'}
      </h3>
    </header>
    <section className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length > 0 ? (
        messages.map((msg) => {
          const isOwnMessage = msg.User.ID === user?.ID;
          const senderName = msg.User.Fullname || msg.User.Username;
          return (
            <div
              key={msg.ID}
              className={`mb-4 flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwnMessage && (
                <Avatar className="mr-2" style={{ backgroundColor: '#87d068' }}>
                  {getInitials(senderName)}
                </Avatar>
              )}
              <div
                className={`max-w-xs mx-2 px-3 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm">{msg.Message}</div>
                <div className="text-xs mt-1 text-right">
                  {new Date(msg.CreatedAt).toLocaleTimeString()}
                </div>
              </div>
              {isOwnMessage && (
                <Avatar className="ml-2" style={{ backgroundColor: '#1890ff' }}>
                  {getInitials(senderName)}
                </Avatar>
              )}
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-gray-500">No messages yet.</p>
        </div>
      )}
      {/* Dummy div untuk auto-scroll */}
      <div ref={messagesEndRef} />
    </section>
    <footer className="px-4 py-3 border-t">
      <div className="flex flex-col gap-2">
        <Input.TextArea
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <Button type="primary" onClick={handleSendMessage} className="w-full">
          Send
        </Button>
      </div>
    </footer>
  </div>
));

//
// Komponen Chat untuk Desktop
//
interface DesktopViewProps {
  messages: IMessageItem[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: () => void;
  selectedChatroom: IChatroom | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  user: IUser | null;
  chatrooms: IChatroom[];
  onNewChatClick: () => void;
  onSelectChatroom: (chatroom: IChatroom) => void;
}

export const DesktopView: React.FC<DesktopViewProps> = React.memo(({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  selectedChatroom,
  messagesEndRef,
  user,
  chatrooms,
  onNewChatClick,
  onSelectChatroom,
}) => {
  const ChatroomList = () => (
    <List
      itemLayout="horizontal"
      dataSource={chatrooms}
      bordered
      renderItem={(room: IChatroom) => (
        <List.Item
          key={room.ID}
          onClick={() => onSelectChatroom(room)}
          className="cursor-pointer p-3 rounded hover:bg-blue-50 transition-colors"
        >
          <List.Item.Meta
            title={room.Name || (room.IsGroup ? 'Group Chat' : 'Direct Chat')}
          />
        </List.Item>
      )}
    />
  );
  
  return (
    <div className="flex flex-row h-[650px] rounded-2xl shadow-lg">
      <aside className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto bg-white rounded-tl-2xl rounded-bl-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chatrooms</h2>
        <Flex vertical gap={10}>
          <ChatroomList />
          <Button type="primary" onClick={onNewChatClick} className="w-full">
            New Chat
          </Button>
        </Flex>
      </aside>
      <main className="w-2/3 flex flex-col rounded-tr-2xl rounded-br-2xl">
        <header className="bg-white border-b border-gray-300 px-4 py-3 rounded-tr-2xl">
          <h3 className="text-xl font-semibold text-gray-800">
            {selectedChatroom
              ? selectedChatroom.Name ||
                (selectedChatroom.IsGroup ? 'Group Chat' : 'Direct Chat')
              : 'Select a chatroom to view messages'}
          </h3>
        </header>
        <section className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {selectedChatroom ? (
            messages.map((msg) => {
              const isOwnMessage = msg.User.ID === user?.ID;
              const senderName = msg.User.Fullname || msg.User.Username;
              return (
                <div
                  key={msg.ID}
                  className={`mb-4 flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="mr-2" style={{ backgroundColor: '#87d068' }}>
                      {getInitials(senderName)}
                    </Avatar>
                  )}
                  <div
                    className={`max-w-md mx-2 px-3 py-2 rounded-lg ${
                      isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm">{msg.Message}</div>
                    <div className="text-xs mt-1 text-right">
                      {new Date(msg.CreatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {isOwnMessage && (
                    <Avatar className="ml-2" style={{ backgroundColor: '#1890ff' }}>
                      {getInitials(senderName)}
                    </Avatar>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-gray-500">Select a chatroom to view messages</p>
            </div>
          )}
          {/* Dummy div untuk auto-scroll */}
          <div ref={messagesEndRef} />
        </section>
        <footer className="px-4 py-3 border-t bg-white rounded-br-2xl">
          <div className="flex flex-row items-center gap-2">
            <Input.TextArea
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Button type="primary" onClick={handleSendMessage} className="whitespace-nowrap">
              Send
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
});

//
// Komponen Chat Utama
//
const Chat: React.FC = () => {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [chatrooms, setChatrooms] = useState<IChatroom[]>([]);
  const [selectedChatroom, setSelectedChatroom] = useState<IChatroom | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  // Modal state untuk membuat chatroom baru
  const [newChatModalVisible, setNewChatModalVisible] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [chatroomName, setChatroomName] = useState<string>('');

  // Ref untuk auto scroll
  const messagesEndRef = useRef<HTMLDivElement>(null!);

  // --- API Calls ---
  const fetchChatrooms = async (): Promise<void> => {
    try {
      const res = await API.get('/chatrooms');
      setChatrooms(res.data.chatrooms);
    } catch (error) {
      console.error('Fetch chatrooms error:', error);
    }
  };

  const fetchMessages = async (chatroomId: number): Promise<void> => {
    try {
      const res = await API.get(`/chatrooms/${chatroomId}/messages`);
      setMessages(res.data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  useEffect(() => {
    const fetchAvailableUsers = async (): Promise<void> => {
      try {
        const res = await API.get('/users');
        const filtered = res.data.users.filter((u: IUser) => u.ID !== user?.ID);
        setAvailableUsers(filtered);
      } catch (error) {
        console.error('Fetch available users error:', error);
      }
    };

    fetchChatrooms();
    fetchAvailableUsers();
  }, [user]);

  // Auto scroll ke pesan paling bawah setiap kali messages berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Event Handlers ---
  const handleSelectChatroom = (chatroom: IChatroom): void => {
    setSelectedChatroom(chatroom);
    fetchMessages(chatroom.ID);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!selectedChatroom) {
      message.error('Please select a chatroom first.');
      return;
    }
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage.length === 0) {
      message.error('Message cannot be empty.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('message', trimmedMessage);
      await API.post(`/chatrooms/${selectedChatroom.ID}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchMessages(selectedChatroom.ID);
      setNewMessage('');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data?.error || 'Failed to send message');
      } else {
        message.error('Failed to send message');
      }
    }
  };

  // Auto-generate chatroom name untuk direct chat
  useEffect(() => {
    if (selectedUserIds.length === 1 && user) {
      const recipient = availableUsers.find((u) => u.ID === selectedUserIds[0]);
      if (recipient) {
        setChatroomName(`${user.Fullname} - ${recipient.Fullname}`);
      }
    } else {
      setChatroomName('');
    }
  }, [selectedUserIds, availableUsers, user]);

  const handleCreateChatroom = async (): Promise<void> => {
    if (selectedUserIds.length === 0) {
      message.error('Please select at least one user for chat.');
      return;
    }
    let finalName = '';
    if (selectedUserIds.length === 1) {
      finalName = chatroomName;
    } else {
      if (chatroomName.trim() === '') {
        message.error('Please enter a group name for group chat.');
        return;
      }
      finalName = chatroomName;
    }
    const isGroup = selectedUserIds.length > 1;
    try {
      const payload = {
        is_group: isGroup,
        name: finalName,
        user_ids: selectedUserIds,
      };
      await API.post('/chatrooms', payload);
      message.success('Chatroom created successfully.');
      setNewChatModalVisible(false);
      setSelectedUserIds([]);
      setChatroomName('');
      fetchChatrooms();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data?.error || 'Failed to create chatroom');
      } else {
        message.error('Failed to create chatroom');
      }
    }
  };

  // Komponen daftar chatroom untuk Mobile
  const MobileSidebar = () => (
    <div className="w-full overflow-y-auto p-4 bg-white rounded-2xl mb-10 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Chatrooms</h2>
      <Flex vertical gap={10}>
        <List
          itemLayout="horizontal"
          dataSource={chatrooms}
          bordered
          className="mb-4"
          renderItem={(room: IChatroom) => (
            <List.Item
              key={room.ID}
              onClick={() => handleSelectChatroom(room)}
              className="cursor-pointer p-3 rounded hover:bg-blue-50 transition-colors"
            >
              <List.Item.Meta
                title={room.Name || (room.IsGroup ? 'Group Chat' : 'Direct Chat')}
              />
            </List.Item>
          )}
        />
        <Button
          type="primary"
          onClick={() => setNewChatModalVisible(true)}
          className="mt-4 w-full"
        >
          New Chat
        </Button>
      </Flex>
    </div>
  );

  return (
    <>
      {isMobile ? (
        selectedChatroom ? (
          <MobileChat
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            selectedChatroom={selectedChatroom}
            messagesEndRef={messagesEndRef}
            user={user}
            onBack={() => setSelectedChatroom(null)}
          />
        ) : (
          <MobileSidebar />
        )
      ) : (
        <DesktopView
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          selectedChatroom={selectedChatroom}
          messagesEndRef={messagesEndRef}
          user={user}
          chatrooms={chatrooms}
          onNewChatClick={() => setNewChatModalVisible(true)}
          onSelectChatroom={handleSelectChatroom}
        />
      )}

      {/* Modal: Create New Chatroom */}
      <Modal
        title="Create New Chatroom"
        visible={newChatModalVisible}
        onCancel={() => setNewChatModalVisible(false)}
        onOk={handleCreateChatroom}
        okText="Create Chatroom"
      >
        <Form layout="vertical">
          <Form.Item label="Select Users" required>
            <Select
              mode="multiple"
              placeholder="Select users to chat with"
              onChange={(value: number[]) => setSelectedUserIds(value)}
              value={selectedUserIds}
              className="w-full"
            >
              {availableUsers.map((u: IUser) => (
                <Select.Option key={u.ID} value={u.ID}>
                  {u.Username} ({u.Fullname})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Chatroom Name" required>
            {selectedUserIds.length === 1 ? (
              <Input
                value={
                  user && availableUsers.find((u) => u.ID === selectedUserIds[0])
                    ? `${user.Fullname} - ${availableUsers.find((u) => u.ID === selectedUserIds[0])!.Fullname}`
                    : ''
                }
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <Input
                placeholder="Enter group chat name"
                value={chatroomName}
                onChange={(e) => setChatroomName(e.target.value)}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Chat;