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
  const [] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMessageSending, setIsMessageSending] = useState(false);

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
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://web-chat-application-t77k.onrender.com';
    console.log('Socket.IO URL:', socketUrl);

    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Bağlantı olaylarını dinle
    socketRef.current.on('connect', () => {
      console.log('Socket.IO bağlantısı kuruldu');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO bağlantı hatası:', error);
    });

    // Yeni mesaj dinleyicisi
    socketRef.current.on('receive_message', (message: Message) => {
      console.log('Socket üzerinden yeni mesaj alındı:', message);
      // Sadece karşı taraftan gelen mesajları ekle
      if (message.sender_id === selectedUser._id) {
        setMessages(prevMessages => {
          // Mesajın zaten eklenip eklenmediğini kontrol et
          const messageExists = prevMessages.some(m => m._id === message._id);
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
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
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-chat-application-t77k.onrender.com/api';

      console.log('Mesajlar yükleniyor...', { senderId, receiverId });
      
      const response = await fetch(`${apiUrl}/messages/between/${senderId}/${receiverId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      console.log('Mesaj API Yanıt Status:', response.status);
      
      // Yanıtın içeriğini önce text olarak al
      const text = await response.text();
      console.log('Ham API Yanıtı:', text);

      // Eğer yanıt boşsa veya HTML içeriyorsa hata fırlat
      if (!text || text.includes('<!DOCTYPE')) {
        throw new Error('Geçersiz API yanıtı');
      }

      // Text'i JSON'a çevir
      const data = JSON.parse(text);
      console.log('İşlenmiş Mesajlar:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Mesajlar alınamadı');
      }

      // Mesajları kontrol et ve sırala
      const sortedMessages = Array.isArray(data) 
        ? data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [];

      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('token') || errorMessage.includes('yetkilendirme')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError('Mesajlar yüklenirken bir hata oluştu: ' + error.message);
      }
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
    if (!newMessage.trim() || !currentUser || isMessageSending) return;

    try {
      setIsMessageSending(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-chat-application-t77k.onrender.com/api';
      const token = localStorage.getItem('token');

      console.log('Mesaj gönderiliyor:', {
        sender_id: currentUser._id,
        receiver_id: selectedUser._id,
        content: newMessage
      });

      const response = await fetch(`${apiUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          sender_id: currentUser._id,
          receiver_id: selectedUser._id,
          content: newMessage.trim()
        })
      });

      console.log('Mesaj API Yanıt Status:', response.status);

      // Yanıtı önce text olarak al
      const text = await response.text();
      console.log('Ham API Yanıtı:', text);

      // Text'i JSON'a çevir
      let message;
      try {
        message = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse hatası:', e);
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      if (!response.ok) {
        throw new Error(message.error || 'Mesaj gönderilemedi');
      }

      if (message._id) {
        console.log('Mesaj başarıyla gönderildi:', message);
        
        // Mesajı önce state'e ekle
        setMessages(prevMessages => {
          // Mesajın zaten eklenip eklenmediğini kontrol et
          const messageExists = prevMessages.some(m => m._id === message._id);
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });

        // Socket üzerinden mesajı gönder
        if (socketRef.current) {
          socketRef.current.emit('send_message', message);
        }
        
        setNewMessage('');
        setError('');

        // 2 saniye sonra yeni mesaj göndermeye izin ver
        setTimeout(() => {
          setIsMessageSending(false);
        }, 2000);
      } else {
        throw new Error('Geçersiz mesaj yanıtı');
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      if (error instanceof Error) {
        setError('Mesaj gönderilirken bir hata oluştu: ' + error.message);
      } else {
        setError('Mesaj gönderilirken beklenmeyen bir hata oluştu');
      }
      setIsMessageSending(false);
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#1F2937]">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-100">{selectedUser.username}</h2>
            {/* Çevrimiçi durumu buraya eklenebilir */}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:bg-gray-700/50 rounded-full p-2 transition-colors duration-200"
          aria-label="Close Chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      
      {/* Messages */}
      <div className="h-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1E293B] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mesajlar yükleniyor...
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-gray-800/50 p-6 rounded-2xl flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Sohbete Başla</h3>
                <p className="text-gray-400 text-center max-w-sm">
                  {selectedUser.username} ile sohbetiniz başlamak için hazır. İlk mesajınızı göndererek sohbete başlayabilirsiniz.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender_id === currentUser?._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] break-words rounded-lg px-4 py-2 ${
                    message.sender_id === currentUser?._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div>{message.content}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          
          {/* Yazıyor göstergesi */}
          {typingStatus.isTyping && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm bg-gray-800/50 py-2 px-4 rounded-full w-fit">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {selectedUser.username} yazıyor
                {typingStatus.characterCount > 0 && ` (${typingStatus.characterCount} karakter)`}
              </span>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-[#1F2937]">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Bir mesaj yazın..."
              className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 