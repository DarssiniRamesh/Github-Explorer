import { ConnectOptions } from 'mongoose';

export interface DatabaseConfig {
    url: string;
    options: ConnectOptions;
}

// PUBLIC_INTERFACE
export const getDatabaseConfig = (): DatabaseConfig => {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/audio-watermark';

    return {
        url: mongoUrl,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        } as ConnectOptions
    };
};
