import { Router } from 'express';
import { APIError } from '../middleware';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Base route for audio watermarking operations
router.use('/audio', (req, res) => {
    throw new APIError(501, 'Audio watermarking endpoints not implemented yet');
});

export default router;
