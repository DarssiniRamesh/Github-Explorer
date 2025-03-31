import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Interface for audio file metadata
 */
export interface AudioMetadata {
    duration: number;    // Duration in seconds
    bitrate: number;    // Bitrate in kbps
    channels: number;   // Number of audio channels
    format: string;     // Audio format (e.g., 'mp3', 'wav')
    sampleRate: number; // Sample rate in Hz
}

/**
 * Class containing FFmpeg utility functions for audio processing
 */
export class FFmpegUtil {
    private static readonly TEMP_DIR = 'temp';

    /**
     * Initialize temporary directory
     */
    public static async init(): Promise<void> {
        try {
            await fs.mkdir(this.TEMP_DIR, { recursive: true });
        } catch (error) {
            throw new Error(`Failed to initialize temp directory: ${error.message}`);
        }
    }

    /**
     * Generate a unique temporary file path
     */
    private static async generateTempPath(extension: string): Promise<string> {
        const randomName = crypto.randomBytes(16).toString('hex');
        return path.join(this.TEMP_DIR, `${randomName}.${extension}`);
    }

    /**
     * Clean up temporary files
     */
    public static async cleanup(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error(`Failed to cleanup temp file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Get audio file metadata
     * @param filePath Path to the audio file
     * @returns Promise resolving to AudioMetadata
     */
    public static async getMetadata(filePath: string): Promise<AudioMetadata> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Failed to get audio metadata: ${err.message}`));
                    return;
                }

                const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
                if (!audioStream) {
                    reject(new Error('No audio stream found in file'));
                    return;
                }

                resolve({
                    duration: metadata.format.duration || 0,
                    bitrate: parseInt(metadata.format.bit_rate) / 1000 || 0,
                    channels: audioStream.channels || 0,
                    format: path.extname(filePath).slice(1),
                    sampleRate: parseInt(audioStream.sample_rate) || 0
                });
            });
        });
    }

    /**
     * Convert audio to specified format
     * @param inputPath Path to input audio file
     * @param outputFormat Desired output format (e.g., 'mp3', 'wav')
     * @returns Promise resolving to path of converted file
     */
    public static async convertFormat(inputPath: string, outputFormat: string): Promise<string> {
        const outputPath = await this.generateTempPath(outputFormat);

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat(outputFormat)
                .on('error', (err) => {
                    reject(new Error(`Failed to convert audio format: ${err.message}`));
                })
                .on('end', () => {
                    resolve(outputPath);
                })
                .save(outputPath);
        });
    }

    /**
     * Normalize audio volume
     * @param inputPath Path to input audio file
     * @returns Promise resolving to path of normalized file
     */
    public static async normalizeVolume(inputPath: string): Promise<string> {
        const outputPath = await this.generateTempPath(path.extname(inputPath).slice(1));

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFilters('loudnorm')
                .on('error', (err) => {
                    reject(new Error(`Failed to normalize audio: ${err.message}`));
                })
                .on('end', () => {
                    resolve(outputPath);
                })
                .save(outputPath);
        });
    }

    /**
     * Prepare audio for watermarking by ensuring consistent format and normalization
     * @param inputPath Path to input audio file
     * @returns Promise resolving to path of prepared file
     */
    public static async prepareForWatermarking(inputPath: string): Promise<string> {
        // Convert to WAV format for consistent watermarking
        const wavPath = await this.convertFormat(inputPath, 'wav');
        
        try {
            // Normalize audio volume
            const normalizedPath = await this.normalizeVolume(wavPath);
            
            // Cleanup intermediate file
            await this.cleanup(wavPath);
            
            return normalizedPath;
        } catch (error) {
            // Cleanup intermediate file on error
            await this.cleanup(wavPath);
            throw error;
        }
    }
}
