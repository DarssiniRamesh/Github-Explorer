import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import config from '../config';

/**
 * Configuration for audio file upload handling
 */
class UploadMiddleware {
    private static readonly ALLOWED_AUDIO_TYPES = [
        'audio/mpeg',        // .mp3
        'audio/wav',         // .wav
        'audio/ogg',         // .ogg
        'audio/aac',         // .aac
        'audio/x-m4a'        // .m4a
    ];

    private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    private static storage = multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            cb(null, config.uploadDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    private static fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (UploadMiddleware.ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    };

    /**
     * PUBLIC_INTERFACE
     * Multer middleware configuration for handling audio file uploads
     */
    public static readonly upload = multer({
        storage: UploadMiddleware.storage,
        fileFilter: UploadMiddleware.fileFilter,
        limits: {
            fileSize: UploadMiddleware.MAX_FILE_SIZE
        }
    });
}

export default UploadMiddleware;
