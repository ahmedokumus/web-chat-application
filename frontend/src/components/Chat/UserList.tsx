'use client';

import { useEffect, useState } from 'react';
import { User } from '@/services/api';

interface UserListProps {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserList({ onSelectUser, selectedUser, isOpen, onClose }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  useEffect(() => {
    // Önce mevcut kullanıcıyı al, sonra kullanıcıları getir
    const initializeUsers = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        await fetchUsers(user._id);
      }
    };

    initializeUsers();
  }, []);

  const fetchUsers = async (currentUserId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-chat-application-t77k.onrender.com/api';
      
      console.log('API URL:', apiUrl);
      console.log('Token:', token ? 'Mevcut' : 'Bulunamadı');
      
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      const response = await fetch(`${apiUrl}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      console.log('API Yanıt Status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Oturum süresi dolmuş');
        }
        throw new Error(`HTTP hata: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Yanıtı:', data);

      // Mevcut kullanıcıyı filtrele
      const filteredUsers = Array.isArray(data) ? data.filter((user: User) => user._id !== currentUserId) : [];
      console.log('Filtrelenmiş kullanıcılar:', filteredUsers);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('token') || 
            errorMessage.includes('oturum') || 
            errorMessage.includes('401')) {
          console.log('Oturum hatası tespit edildi, yönlendiriliyor...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay - sidebar açıkken arka planı karartır */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        h-full w-80 flex flex-col bg-[#1F2937]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-gray-700/50
      `}>
        {/* Başlık */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#1F2937]">
          <h2 className="text-lg font-semibold text-gray-100">Sohbetler</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıkış
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Kullanıcı listesi */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kullanıcılar yükleniyor...
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`
                    p-4 cursor-pointer transition-colors
                    flex items-center space-x-3
                    ${selectedUser?._id === user._id 
                      ? 'bg-[#374151]' 
                      : 'hover:bg-[#374151]'
                    }
                  `}
                >
                  {/* Kullanıcı avatarı */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-medium">
                      {user.username[0].toUpperCase()}
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1F2937]"></div>
                    )}
                  </div>

                  {/* Kullanıcı bilgileri */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-100">{user.username}</div>
                    <div className="text-sm text-gray-400">
                      {user.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                Henüz hiç kullanıcı yok
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 