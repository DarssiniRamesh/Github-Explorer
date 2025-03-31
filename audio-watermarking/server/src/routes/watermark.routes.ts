import { Router } from 'express';
import { WatermarkController } from '../controllers/watermark.controller';
import UploadMiddleware from '../middleware/upload.middleware';

/**
 * Router for audio watermarking operations
 */
class WatermarkRouter {
    private readonly router: Router;
    private readonly controller: WatermarkController;

    constructor(encryptionKey: string) {
        this.router = Router();
        this.controller = new WatermarkController(encryptionKey);
        this.setupRoutes();
    }

    /**
     * Sets up routes for watermarking operations
     */
    private setupRoutes(): void {
        // Route for embedding watermark
        this.router.post(
            '/embed',
            UploadMiddleware.upload.single('audio'),
            this.controller.embedWatermark
        );

        // Route for extracting watermark
        this.router.post(
            '/extract',
            UploadMiddleware.upload.single('audio'),
            this.controller.extractWatermark
        );

        // Route for verifying watermark
        this.router.post(
            '/verify',
            UploadMiddleware.upload.single('audio'),
            this.controller.verifyWatermark
        );
    }

    /**
     * PUBLIC_INTERFACE
     * Gets the configured router
     */
    public getRouter(): Router {
        return this.router;
    }
}

export default WatermarkRouter;
