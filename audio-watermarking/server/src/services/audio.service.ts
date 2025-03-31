import { FFmpegUtil, AudioMetadata } from '../utils/ffmpeg.util';
import path from 'path';

/**
 * Interface for audio processing options
 */
export interface AudioProcessingOptions {
    normalize?: boolean;      // Whether to normalize audio volume
    targetFormat?: string;    // Target audio format for conversion
}

/**
 * Service class for audio processing operations
 */
export class AudioService {
    /**
     * Initialize the audio service
     */
    public static async init(): Promise<void> {
        await FFmpegUtil.init();
    }

    /**
     * Process audio file with specified options
     * @param filePath Path to the audio file
     * @param options Processing options
     * @returns Promise resolving to processed file path and metadata
     */
    public static async processAudio(
        filePath: string,
        options: AudioProcessingOptions = {}
    ): Promise<{ filePath: string; metadata: AudioMetadata }> {
        let processedPath = filePath;
        const cleanup: string[] = [];

        try {
            // Convert format if specified
            if (options.targetFormat) {
                const currentFormat = path.extname(processedPath).slice(1);
                if (currentFormat !== options.targetFormat) {
                    const convertedPath = await FFmpegUtil.convertFormat(processedPath, options.targetFormat);
                    if (processedPath !== filePath) {
                        cleanup.push(processedPath);
                    }
                    processedPath = convertedPath;
                }
            }

            // Normalize volume if requested
            if (options.normalize) {
                const normalizedPath = await FFmpegUtil.normalizeVolume(processedPath);
                if (processedPath !== filePath) {
                    cleanup.push(processedPath);
                }
                processedPath = normalizedPath;
            }

            // Get metadata of processed file
            const metadata = await FFmpegUtil.getMetadata(processedPath);

            return { filePath: processedPath, metadata };
        } catch (error) {
            // Cleanup any temporary files on error
            await Promise.all(cleanup.map(path => FFmpegUtil.cleanup(path)));
            throw error;
        }
    }

    /**
     * Prepare audio for watermarking
     * @param filePath Path to the audio file
     * @returns Promise resolving to prepared file path and metadata
     */
    public static async prepareForWatermarking(
        filePath: string
    ): Promise<{ filePath: string; metadata: AudioMetadata }> {
        try {
            const preparedPath = await FFmpegUtil.prepareForWatermarking(filePath);
            const metadata = await FFmpegUtil.getMetadata(preparedPath);
            return { filePath: preparedPath, metadata };
        } catch (error) {
            throw new Error(`Failed to prepare audio for watermarking: ${error.message}`);
        }
    }

    /**
     * Get audio file metadata
     * @param filePath Path to the audio file
     * @returns Promise resolving to audio metadata
     */
    public static async getMetadata(filePath: string): Promise<AudioMetadata> {
        try {
            return await FFmpegUtil.getMetadata(filePath);
        } catch (error) {
            throw new Error(`Failed to get audio metadata: ${error.message}`);
        }
    }

    /**
     * Convert audio to specified format
     * @param filePath Path to the audio file
     * @param targetFormat Target audio format
     * @returns Promise resolving to converted file path and metadata
     */
    public static async convertFormat(
        filePath: string,
        targetFormat: string
    ): Promise<{ filePath: string; metadata: AudioMetadata }> {
        try {
            const convertedPath = await FFmpegUtil.convertFormat(filePath, targetFormat);
            const metadata = await FFmpegUtil.getMetadata(convertedPath);
            return { filePath: convertedPath, metadata };
        } catch (error) {
            throw new Error(`Failed to convert audio format: ${error.message}`);
        }
    }

    /**
     * Clean up temporary files
     * @param filePaths Array of file paths to clean up
     */
    public static async cleanup(filePaths: string[]): Promise<void> {
        await Promise.all(filePaths.map(path => FFmpegUtil.cleanup(path)));
    }
}
