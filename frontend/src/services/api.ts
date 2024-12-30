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

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Kayıt işlemi başarısız oldu');
    }

    return response.json();
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Giriş işlemi başarısız oldu');
    }

    return response.json();
  },
}; 