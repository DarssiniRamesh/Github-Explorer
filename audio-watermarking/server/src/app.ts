import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Import routes (to be implemented)
// import watermarkRoutes from './routes/watermark.routes';
// import hashRoutes from './routes/hash.routes';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files directory for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Audio Watermarking API is running' });
});

// Implement routes when ready
// app.use('/api/watermark', watermarkRoutes);
// app.use('/api/hash', hashRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;
