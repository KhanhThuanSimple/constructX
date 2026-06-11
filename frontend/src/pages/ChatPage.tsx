// src/pages/ChatPage.tsx
import React from 'react';
import Layout from '../components/Layout';
import { ChatContainer } from '../components/chat/ChatContainer';

const ChatPage: React.FC = () => {
  return (
    // Dùng Layout không title để hưởng sidebar nav
    // Override padding bằng -m-6 để chat chiếm toàn bộ height
    <Layout title="Tin nhắn">
      <div className="-m-6 h-[calc(100vh-4rem)]">
        <ChatContainer />
      </div>
    </Layout>
  );
};

export default ChatPage;
