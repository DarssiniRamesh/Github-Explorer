import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import config from '../config';

// Custom error class for API errors
export class APIError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// Error handling middleware
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    return res.status(500).json({
        error: 'Internal server error'
    });
};

// CORS configuration
export const corsMiddleware = cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Logging middleware
export const loggingMiddleware = morgan(config.nodeEnv === 'development' ? 'dev' : 'combined');

// Security middleware
export const securityMiddleware = helmet();

// Not found middleware
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(404).json({
        error: 'Resource not found'
    });
};
