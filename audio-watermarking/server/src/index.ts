import app from './app';
import config from './config';

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const startServer = async () => {
    try {
        const server = app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
        });

        // Graceful shutdown
        const shutdown = () => {
            console.log('Shutting down server...');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
