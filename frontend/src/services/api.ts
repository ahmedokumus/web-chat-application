const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-chat-application-t77k.onrender.com/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface LoginResponse {
  user: User;
  token: string;
}

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Bir hata oluştu');
    }
    return data;
  }
  throw new Error('Sunucudan geçersiz yanıt alındı');
};

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },
}; 