'use client';

import { useEffect, useState } from 'react';
import UserList from '@/components/Chat/UserList';
import ChatBox from '@/components/Chat/ChatBox';
import { User } from '@/services/api';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Kullanıcı girişi kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Banner için boşluk */}
      <div className="h-7" /> {/* Banner yüksekliği kadar boşluk */}

      {/* Chat container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sol taraf - Kullanıcı listesi */}
        <div className="w-1/4 min-w-[280px] border-r border-input-border bg-card-background">
          <UserList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
        </div>

        {/* Sağ taraf - Chat alanı */}
        <div className="flex-1 bg-background">
          {selectedUser ? (
            <ChatBox selectedUser={selectedUser} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <svg 
                className="w-16 h-16 mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium mb-2">Sohbete Başlayın</p>
              <p className="text-sm text-gray-400">
                Sol taraftan bir kullanıcı seçerek sohbete başlayabilirsiniz
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 