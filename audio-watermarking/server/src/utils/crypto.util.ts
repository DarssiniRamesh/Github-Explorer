import CryptoJS from 'crypto-js';

/**
 * Utility class for cryptographic operations used in audio watermarking
 */
export class CryptoUtil {
    /**
     * PUBLIC_INTERFACE
     * Generates a unique hash for a watermark using the audio data and timestamp
     * @param audioData - The audio data buffer as base64 string
     * @param timestamp - Timestamp of watermark creation
     * @returns A unique 128-bit hash as string
     */
    static generateWatermarkHash(audioData: string, timestamp: number): string {
        const data = `${audioData}-${timestamp}`;
        return CryptoJS.SHA256(data).toString();
    }

    /**
     * PUBLIC_INTERFACE
     * Encrypts the watermark data using AES encryption
     * @param watermarkData - Data to be encrypted
     * @param key - Encryption key
     * @returns Encrypted data as string
     */
    static encryptWatermark(watermarkData: string, key: string): string {
        return CryptoJS.AES.encrypt(watermarkData, key).toString();
    }

    /**
     * PUBLIC_INTERFACE
     * Decrypts the watermark data
     * @param encryptedData - Encrypted watermark data
     * @param key - Decryption key
     * @returns Decrypted data as string
     */
    static decryptWatermark(encryptedData: string, key: string): string {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    /**
     * PUBLIC_INTERFACE
     * Verifies if a watermark hash matches the original data
     * @param originalHash - Original watermark hash
     * @param audioData - Audio data to verify
     * @param timestamp - Original timestamp used in hash generation
     * @returns boolean indicating if the watermark is valid
     */
    static verifyWatermarkHash(originalHash: string, audioData: string, timestamp: number): boolean {
        const generatedHash = this.generateWatermarkHash(audioData, timestamp);
        return originalHash === generatedHash;
    }

    /**
     * PUBLIC_INTERFACE
     * Generates a verification code for the watermarked audio
     * @param watermarkHash - Hash of the watermark
     * @param metadata - Additional metadata for verification
     * @returns Verification code as string
     */
    static generateVerificationCode(watermarkHash: string, metadata: Record<string, any>): string {
        const data = JSON.stringify({ hash: watermarkHash, metadata });
        return CryptoJS.HmacSHA256(data, watermarkHash).toString();
    }
}
