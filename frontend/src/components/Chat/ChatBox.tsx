'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/services/api';
import { io, Socket } from 'socket.io-client';

const formatMessageTime = (dateString: string) => {
  const messageDate = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
  
  // Bugün gönderilen mesajlar için sadece saat
  if (diffInHours < 24 && messageDate.getDate() === now.getDate()) {
    return messageDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Dün gönderilen mesajlar için
  if (diffInHours < 48 && messageDate.getDate() === now.getDate() - 1) {
    return `Dün ${messageDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
  
  // Bu hafta içinde gönderilen mesajlar için gün adı ve saat
  if (diffInHours < 168) { // 7 gün
    return messageDate.toLocaleDateString('tr-TR', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Daha eski mesajlar için tam tarih
  return messageDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface Message {
  _id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  createdAt: string;
}

interface ChatBoxProps {
  selectedUser: User;
  onClose?: () => void;
}

interface TypingStatus {
  isTyping: boolean;
  characterCount: number;
}

export default function ChatBox({ selectedUser, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({ isTyping: false, characterCount: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Yeni mesajlar geldiğinde scroll'u en alta kaydır
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Socket.IO bağlantısını kur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !selectedUser) return;

    // Socket.IO bağlantısını başlat
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });

    // Bağlantı olaylarını dinle
    socketRef.current.on('connect', () => {
      console.log('Socket.IO bağlantısı kuruldu');
    });

    // Yeni mesaj dinleyicisi
    socketRef.current.on('receive_message', (message: Message) => {
      console.log('Yeni mesaj alındı:', message);
      if (message.sender_id === selectedUser._id || message.receiver_id === selectedUser._id) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });

    // Yazıyor durumu dinleyicisi
    socketRef.current.on('user_typing', (data: { userId: string; username: string; characterCount: number }) => {
      console.log('Yazma durumu alındı:', data);
      if (data.userId === selectedUser._id) {
        setTypingStatus({ isTyping: true, characterCount: data.characterCount });
      }
    });

    socketRef.current.on('user_stop_typing', (data: { userId: string }) => {
      console.log('Yazma durumu durduruldu:', data);
      if (data.userId === selectedUser._id) {
        setTypingStatus({ isTyping: false, characterCount: 0 });
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error);
      setError('Gerçek zamanlı bağlantı kurulamadı');
    });

    // Component unmount olduğunda bağlantıyı kapat
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser]);

  // Chat başlatma ve mesajları yükleme
  const fetchMessages = useCallback(async (senderId: string, receiverId: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/between/${senderId}/${receiverId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Mesajlar alınamadı');
      }

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
      scrollToBottom();
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      setError('Mesajlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    const initializeChat = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr && selectedUser) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          await fetchMessages(user._id, selectedUser._id);
        } catch (error) {
          console.error('Kullanıcı bilgisi parse edilemedi:', error);
          setError('Oturum bilgileriniz geçersiz. Lütfen tekrar giriş yapın.');
        }
      }
    };

    initializeChat();
  }, [selectedUser, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sender_id: currentUser._id,
          receiver_id: selectedUser._id,
          content: newMessage
        })
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }

      const message = await response.json();
      if (message._id) {
        // Socket üzerinden mesajı gönder
        if (socketRef.current) {
          socketRef.current.emit('send_message', message);
        }
        
        setMessages(prevMessages => [...prevMessages, message]);
        setNewMessage('');
      } else {
        throw new Error('Geçersiz mesaj yanıtı');
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      setError('Mesaj gönderilirken bir hata oluştu');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);
    
    // Yazma durumunu socket üzerinden gönder
    if (socketRef.current && currentUser) {
      const typingData = {
        sender_id: currentUser._id,
        receiver_id: selectedUser._id,
        characterCount: text.length || 0
      };
      console.log('Yazma durumu gönderiliyor:', typingData);
      socketRef.current.emit('typing', typingData);

      // Önceki timeout'u temizle
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // 2 saniye sonra yazma durumunu false yap
      typingTimeoutRef.current = setTimeout(() => {
        const stopTypingData = {
          sender_id: currentUser._id,
          receiver_id: selectedUser._id
        };
        console.log('Yazma durumu durduruluyor:', stopTypingData);
        socketRef.current?.emit('stop_typing', stopTypingData);
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Mesajlar yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#111827]">
      {/* Başlık */}
      <div className="px-6 py-4 border-b border-gray-700 bg-[#1F2937]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {selectedUser.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-100">{selectedUser.username}</div>
              <div className="text-sm text-gray-400">
                {typingStatus.isTyping 
                  ? `Yazıyor... (${typingStatus.characterCount} karakter)` 
                  : selectedUser.isOnline 
                    ? 'Çevrimiçi' 
                    : 'Son görülme: 1 saat önce'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full transition-all duration-200"
            title="Sohbeti Kapat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mesaj alanı */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 max-w-full scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent bg-[#111827]">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex w-full ${message.sender_id === currentUser?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                relative max-w-[60%] p-3 rounded-2xl group break-words whitespace-pre-wrap
                ${message.sender_id === currentUser?._id
                  ? 'bg-[#3B82F6] text-white rounded-br-sm'
                  : 'bg-[#374151] text-gray-100 rounded-bl-sm'
                }
              `}
            >
              <div className="break-all whitespace-pre-wrap overflow-hidden">{message.content}</div>
              <div 
                className={`
                  text-xs mt-1 opacity-60
                  ${message.sender_id === currentUser?._id ? 'text-gray-100' : 'text-gray-300'}
                `}
              >
                {formatMessageTime(message.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj gönderme formu */}
      <div className="p-4 border-t border-gray-700 bg-[#1F2937]">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Bir mesaj yazın..."
            className="flex-1 px-4 py-2 bg-[#374151] border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
} 