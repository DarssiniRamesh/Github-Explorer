import express from 'express';
import { json, urlencoded } from 'express';
import {
    corsMiddleware,
    loggingMiddleware,
    securityMiddleware,
    errorHandler,
    notFoundHandler
} from './middleware';
import routes from './routes';

const app = express();

// Apply security middleware first
app.use(securityMiddleware);

// Apply CORS middleware
app.use(corsMiddleware);

// Apply logging middleware
app.use(loggingMiddleware);

// Parse JSON and URL-encoded bodies
app.use(json());
app.use(urlencoded({ extended: true }));

// Apply API routes
app.use('/api', routes);

// Handle 404 errors
app.use(notFoundHandler);

// Apply error handling middleware last
app.use(errorHandler);

export default app;
