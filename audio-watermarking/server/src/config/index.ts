import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    mongoUri: string;
    corsOrigin: string;
    uploadDir: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/audio-watermark',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
};

export default config;
