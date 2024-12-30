'use client';

import { useEffect, useState } from 'react';
import { User } from '@/services/api';

interface UserListProps {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
}

export default function UserList({ onSelectUser, selectedUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      // Mevcut kullanıcıyı filtrele
      const filteredUsers = data.filter((user: User) => user._id !== currentUserId);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-[#111827]">
        <div className="p-4 border-b border-gray-700 bg-[#1F2937]">
          <h2 className="text-lg font-semibold text-gray-100">Sohbetler</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Kullanıcılar yükleniyor...
        </div>
      </div>
    );
  }
  

  return (
    <div className="h-full flex flex-col bg-[#111827]">
      {/* Başlık */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#1F2937]">
        <h2 className="text-lg font-semibold text-gray-100">Sohbetler</h2>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Çıkış
        </button>
      </div>

      {/* Kullanıcı listesi */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`
                p-4 cursor-pointer transition-colors
                flex items-center space-x-3
                ${selectedUser?._id === user._id 
                  ? 'bg-[#1F2937]' 
                  : 'hover:bg-[#1F2937]'
                }
              `}
            >
              {/* Kullanıcı avatarı */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
                  {user.username[0].toUpperCase()}
                </div>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111827]"></div>
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
    </div>
  );
} 