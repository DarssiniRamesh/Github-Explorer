import { Request, Response } from 'express';
import fs from 'fs/promises';
import { WatermarkService } from '../services/watermark.service';
import config from '../config';

/**
 * Controller for handling audio watermarking operations
 */
export class WatermarkController {
    private readonly watermarkService: WatermarkService;

    constructor(encryptionKey: string) {
        this.watermarkService = new WatermarkService(encryptionKey);
    }

    /**
     * PUBLIC_INTERFACE
     * Embeds a watermark into an audio file
     */
    public embedWatermark = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file provided' });
                return;
            }

            const { creator, description, additionalData } = req.body;
            const audioData = await fs.readFile(req.file.path, { encoding: 'base64' });

            const metadata = {
                timestamp: Date.now(),
                creator,
                description,
                additionalData: additionalData ? JSON.parse(additionalData) : undefined
            };

            const result = await this.watermarkService.embedWatermark(audioData, metadata);

            // Save watermarked audio to file
            const outputPath = `${config.uploadDir}/watermarked-${req.file.filename}`;
            await fs.writeFile(outputPath, Buffer.from(result.watermarkedAudio, 'base64'));

            // Clean up original file
            await fs.unlink(req.file.path);

            res.status(200).json({
                message: 'Watermark embedded successfully',
                watermarkHash: result.watermarkHash,
                verificationCode: result.verificationCode,
                metadata: result.metadata,
                watermarkedFile: outputPath
            });
        } catch (error) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            res.status(500).json({ error: error.message });
        }
    };

    /**
     * PUBLIC_INTERFACE
     * Extracts a watermark from an audio file
     */
    public extractWatermark = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file provided' });
                return;
            }

            const audioData = await fs.readFile(req.file.path, { encoding: 'base64' });
            const result = await this.watermarkService.extractWatermark(audioData);

            // Clean up uploaded file
            await fs.unlink(req.file.path);

            res.status(200).json({
                message: 'Watermark extracted successfully',
                watermarkHash: result.watermarkHash,
                metadata: result.metadata
            });
        } catch (error) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            res.status(500).json({ error: error.message });
        }
    };

    /**
     * PUBLIC_INTERFACE
     * Verifies a watermark in an audio file
     */
    public verifyWatermark = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file provided' });
                return;
            }

            const { originalHash, verificationCode } = req.body;
            if (!originalHash || !verificationCode) {
                res.status(400).json({ error: 'Original hash and verification code are required' });
                return;
            }

            const audioData = await fs.readFile(req.file.path, { encoding: 'base64' });
            const isValid = await this.watermarkService.verifyWatermark(
                audioData,
                originalHash,
                verificationCode
            );

            // Clean up uploaded file
            await fs.unlink(req.file.path);

            res.status(200).json({
                message: isValid ? 'Watermark verified successfully' : 'Watermark verification failed',
                isValid
            });
        } catch (error) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            res.status(500).json({ error: error.message });
        }
    };
}
