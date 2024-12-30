# Web Chat Uygulaması

Modern ve gerçek zamanlı bir sohbet uygulaması. Next.js ve Node.js teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- Gerçek zamanlı mesajlaşma
- Kullanıcı kimlik doğrulama ve yetkilendirme
- Kullanıcı listesi ve çevrimiçi durumu
- Modern ve responsive arayüz
- Güvenli mesajlaşma altyapısı

## 🛠️ Teknolojiler

### Frontend
- Next.js 13+
- TypeScript
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication

## 📦 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MongoDB
- npm veya yarn

### Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

### Backend Kurulumu
```bash
cd backend
npm install
npm run dev
```

## 🌐 Ortam Değişkenleri

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## 📁 Proje Yapısı

```
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── ...
    ├── package.json
    └── ...
```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Şifrelenmiş mesajlaşma
- Güvenli WebSocket bağlantıları

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Dalınıza push yapın (`git push origin yeni-ozellik`)
5. Bir Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 