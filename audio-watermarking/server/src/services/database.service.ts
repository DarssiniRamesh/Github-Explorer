import mongoose from 'mongoose';
import { getDatabaseConfig } from '../config/database.config';
import { IAudioMetadata, AudioMetadata } from '../models/audio.model';

export class DatabaseService {
    private static instance: DatabaseService;

    private constructor() {}

    // PUBLIC_INTERFACE
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    // PUBLIC_INTERFACE
    public async connect(): Promise<void> {
        try {
            const config = getDatabaseConfig();
            await mongoose.connect(config.url, config.options);
            console.log('Successfully connected to MongoDB.');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log('Successfully disconnected from MongoDB.');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async createAudioMetadata(metadata: Partial<IAudioMetadata>): Promise<IAudioMetadata> {
        try {
            const audioMetadata = new AudioMetadata(metadata);
            return await audioMetadata.save();
        } catch (error) {
            console.error('Error creating audio metadata:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async getAudioMetadataById(id: string): Promise<IAudioMetadata | null> {
        try {
            return await AudioMetadata.findById(id);
        } catch (error) {
            console.error('Error fetching audio metadata:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async getAudioMetadataByHash(hash: string): Promise<IAudioMetadata | null> {
        try {
            return await AudioMetadata.findOne({ originalHash: hash });
        } catch (error) {
            console.error('Error fetching audio metadata by hash:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async updateAudioMetadata(id: string, update: Partial<IAudioMetadata>): Promise<IAudioMetadata | null> {
        try {
            return await AudioMetadata.findByIdAndUpdate(
                id,
                update,
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating audio metadata:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async deleteAudioMetadata(id: string): Promise<boolean> {
        try {
            const result = await AudioMetadata.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.error('Error deleting audio metadata:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    public async listAudioMetadata(page: number = 1, limit: number = 10): Promise<{ items: IAudioMetadata[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await Promise.all([
                AudioMetadata.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                AudioMetadata.countDocuments()
            ]);
            return { items, total };
        } catch (error) {
            console.error('Error listing audio metadata:', error);
            throw error;
        }
    }
}
