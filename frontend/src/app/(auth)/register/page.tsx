'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form validasyonu
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setIsLoading(true);
      const user = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Kayıt başarılı, login sayfasına yönlendir
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-card-background rounded-xl shadow-lg">
        <div className="space-y-3">
          <h2 className="text-center text-3xl font-extrabold text-foreground">
            Aramıza Katılın
          </h2>
          <p className="text-center text-sm text-gray-500">
            Yeni bir hesap oluşturun
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-input-border bg-input-background placeholder-gray-500 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="kullaniciadi"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-input-border bg-input-background placeholder-gray-500 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-input-border bg-input-background placeholder-gray-500 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Şifreyi Tekrar Girin
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-input-border bg-input-background placeholder-gray-500 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`
                group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                text-sm font-medium rounded-lg text-white bg-blue-600 
                hover:bg-blue-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link 
              href="/login" 
              className="font-medium text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out"
            >
              Zaten hesabınız var mı? Giriş yapın
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 