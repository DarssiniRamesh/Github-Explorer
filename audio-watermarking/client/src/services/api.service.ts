import axios, { AxiosInstance } from 'axios';

/**
 * Interface for watermark metadata
 */
export interface WatermarkMetadata {
    timestamp: number;
    creator: string;
    description: string;
    additionalData?: Record<string, unknown>;
}

/**
 * Interface for watermark embed response
 */
export interface WatermarkEmbedResponse {
    message: string;
    watermarkHash: string;
    verificationCode: string;
    metadata: WatermarkMetadata;
    watermarkedFile: string;
}

/**
 * Interface for watermark extract response
 */
export interface WatermarkExtractResponse {
    message: string;
    watermarkHash: string;
    metadata: WatermarkMetadata;
}

/**
 * Interface for watermark verify response
 */
export interface WatermarkVerifyResponse {
    message: string;
    isValid: boolean;
}

/**
 * Service for handling audio watermarking API operations
 */
export class AudioWatermarkService {
    private readonly api: AxiosInstance;

    constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3000') {
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * PUBLIC_INTERFACE
     * Uploads an audio file and embeds a watermark
     * @param audioFile - The audio file to watermark
     * @param metadata - The metadata to embed in the watermark
     * @returns Promise with the watermark embed response
     */
    public async uploadAudio(
        audioFile: File,
        metadata: Omit<WatermarkMetadata, 'timestamp'>
    ): Promise<WatermarkEmbedResponse> {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('creator', metadata.creator);
        formData.append('description', metadata.description);
        if (metadata.additionalData) {
            formData.append('additionalData', JSON.stringify(metadata.additionalData));
        }

        try {
            const response = await this.api.post<WatermarkEmbedResponse>('/watermark/embed', formData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.error || 'Failed to upload audio file');
            }
            throw error;
        }
    }

    /**
     * PUBLIC_INTERFACE
     * Extracts a watermark from an audio file
     * @param audioFile - The audio file to extract the watermark from
     * @returns Promise with the watermark extract response
     */
    public async extractWatermark(audioFile: File): Promise<WatermarkExtractResponse> {
        const formData = new FormData();
        formData.append('audio', audioFile);

        try {
            const response = await this.api.post<WatermarkExtractResponse>('/watermark/extract', formData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.error || 'Failed to extract watermark');
            }
            throw error;
        }
    }

    /**
     * PUBLIC_INTERFACE
     * Verifies a watermark in an audio file
     * @param audioFile - The audio file to verify
     * @param originalHash - The original watermark hash
     * @param verificationCode - The verification code
     * @returns Promise with the watermark verify response
     */
    public async verifyWatermark(
        audioFile: File,
        originalHash: string,
        verificationCode: string
    ): Promise<WatermarkVerifyResponse> {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('originalHash', originalHash);
        formData.append('verificationCode', verificationCode);

        try {
            const response = await this.api.post<WatermarkVerifyResponse>('/watermark/verify', formData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.error || 'Failed to verify watermark');
            }
            throw error;
        }
    }
}

// Export a singleton instance
export const audioWatermarkService = new AudioWatermarkService();
