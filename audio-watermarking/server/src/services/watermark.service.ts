import { Steganography } from 'steganography.js';
import { CryptoUtil } from '../utils/crypto.util';

/**
 * Interface for watermark metadata
 */
interface WatermarkMetadata {
    timestamp: number;
    creator: string;
    description?: string;
    additionalData?: Record<string, any>;
}

/**
 * Interface for watermark result
 */
interface WatermarkResult {
    watermarkedAudio: string;
    watermarkHash: string;
    verificationCode: string;
    metadata: WatermarkMetadata;
}

/**
 * Service class for handling audio watermarking operations
 */
export class WatermarkService {
    private readonly steganography: Steganography;
    private readonly encryptionKey: string;

    constructor(encryptionKey: string) {
        this.steganography = new Steganography();
        this.encryptionKey = encryptionKey;
    }

    /**
     * PUBLIC_INTERFACE
     * Embeds a watermark into an audio file
     * @param audioData - Base64 encoded audio data
     * @param metadata - Metadata to be embedded in the watermark
     * @returns WatermarkResult containing watermarked audio and verification data
     */
    public async embedWatermark(audioData: string, metadata: WatermarkMetadata): Promise<WatermarkResult> {
        try {
            // Generate watermark hash
            const watermarkHash = CryptoUtil.generateWatermarkHash(audioData, metadata.timestamp);

            // Prepare watermark data
            const watermarkData = JSON.stringify({
                hash: watermarkHash,
                metadata
            });

            // Encrypt watermark data
            const encryptedData = CryptoUtil.encryptWatermark(watermarkData, this.encryptionKey);

            // Embed watermark using steganography
            const watermarkedAudio = await this.steganography.encode(audioData, encryptedData);

            // Generate verification code
            const verificationCode = CryptoUtil.generateVerificationCode(watermarkHash, metadata);

            return {
                watermarkedAudio,
                watermarkHash,
                verificationCode,
                metadata
            };
        } catch (error) {
            throw new Error(`Failed to embed watermark: ${error.message}`);
        }
    }

    /**
     * PUBLIC_INTERFACE
     * Extracts a watermark from an audio file
     * @param watermarkedAudio - Base64 encoded watermarked audio data
     * @returns Extracted watermark data and metadata
     */
    public async extractWatermark(watermarkedAudio: string): Promise<{
        watermarkHash: string;
        metadata: WatermarkMetadata;
    }> {
        try {
            // Extract encrypted data using steganography
            const encryptedData = await this.steganography.decode(watermarkedAudio);

            // Decrypt the extracted data
            const decryptedData = CryptoUtil.decryptWatermark(encryptedData, this.encryptionKey);
            const watermarkData = JSON.parse(decryptedData);

            return {
                watermarkHash: watermarkData.hash,
                metadata: watermarkData.metadata
            };
        } catch (error) {
            throw new Error(`Failed to extract watermark: ${error.message}`);
        }
    }

    /**
     * PUBLIC_INTERFACE
     * Verifies the authenticity of a watermarked audio file
     * @param watermarkedAudio - Base64 encoded watermarked audio data
     * @param originalHash - Original watermark hash
     * @param verificationCode - Original verification code
     * @returns Boolean indicating if the watermark is valid
     */
    public async verifyWatermark(
        watermarkedAudio: string,
        originalHash: string,
        verificationCode: string
    ): Promise<boolean> {
        try {
            // Extract watermark data
            const { watermarkHash, metadata } = await this.extractWatermark(watermarkedAudio);

            // Verify hash matches
            if (watermarkHash !== originalHash) {
                return false;
            }

            // Generate verification code and compare
            const generatedCode = CryptoUtil.generateVerificationCode(watermarkHash, metadata);
            return generatedCode === verificationCode;
        } catch (error) {
            throw new Error(`Failed to verify watermark: ${error.message}`);
        }
    }
}
