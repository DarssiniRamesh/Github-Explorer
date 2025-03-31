import { Schema, model, Document } from 'mongoose';

// Interface for the audio metadata document
export interface IAudioMetadata extends Document {
    filename: string;
    originalHash: string;
    watermarkData: string;
    watermarkHash: string;
    processingStatus: 'pending' | 'completed' | 'failed';
    mimeType: string;
    fileSize: number;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition for audio metadata
const AudioMetadataSchema = new Schema<IAudioMetadata>(
    {
        filename: { 
            type: String, 
            required: true 
        },
        originalHash: { 
            type: String, 
            required: true,
            index: true
        },
        watermarkData: { 
            type: String, 
            required: true 
        },
        watermarkHash: { 
            type: String, 
            required: true,
            index: true
        },
        processingStatus: { 
            type: String, 
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        mimeType: { 
            type: String, 
            required: true 
        },
        fileSize: { 
            type: Number, 
            required: true 
        },
        duration: { 
            type: Number, 
            required: true 
        }
    },
    { 
        timestamps: true,
        collection: 'audio_metadata'
    }
);

// Create indexes for efficient querying
AudioMetadataSchema.index({ createdAt: 1 });
AudioMetadataSchema.index({ filename: 1 });

// PUBLIC_INTERFACE
export const AudioMetadata = model<IAudioMetadata>('AudioMetadata', AudioMetadataSchema);
