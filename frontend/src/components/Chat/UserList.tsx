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
      const response = await fetch('http://localhost:5000/api/users', {
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
      <div className="p-4 border-b border-gray-700 bg-[#1F2937]">
        <h2 className="text-lg font-semibold text-gray-100">Sohbetler</h2>
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