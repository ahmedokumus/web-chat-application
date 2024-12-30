import express from 'express';
import cors from 'cors';
import messageRoutes from './routes/messages';

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/messages', messageRoutes);

// Route kontrolü için middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Gelen istekleri logla
  next();
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route bulunamadı:', req.url);
  res.status(404).json({ error: 'Route bulunamadı' });
});

export default app; 