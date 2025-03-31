import { useState, useCallback } from 'react';
import { audioWatermarkService, WatermarkMetadata, WatermarkEmbedResponse, WatermarkExtractResponse, WatermarkVerifyResponse } from '../services/api.service';

/**
 * Interface for the audio watermark hook state
 */
interface AudioWatermarkState {
    loading: boolean;
    error: string | null;
    data: WatermarkEmbedResponse | WatermarkExtractResponse | WatermarkVerifyResponse | null;
}

/**
 * Interface for the audio watermark hook return value
 */
interface UseAudioWatermarkReturn {
    loading: boolean;
    error: string | null;
    data: WatermarkEmbedResponse | WatermarkExtractResponse | WatermarkVerifyResponse | null;
    uploadAudio: (file: File, metadata: Omit<WatermarkMetadata, 'timestamp'>) => Promise<void>;
    extractWatermark: (file: File) => Promise<void>;
    verifyWatermark: (file: File, originalHash: string, verificationCode: string) => Promise<void>;
    reset: () => void;
}

/**
 * Custom hook for handling audio watermarking operations
 * @returns Object containing loading state, error state, data, and watermarking functions
 */
export const useAudioWatermark = (): UseAudioWatermarkReturn => {
    const [state, setState] = useState<AudioWatermarkState>({
        loading: false,
        error: null,
        data: null
    });

    /**
     * Resets the hook state
     */
    const reset = useCallback(() => {
        setState({
            loading: false,
            error: null,
            data: null
        });
    }, []);

    /**
     * Uploads an audio file with watermark
     */
    const uploadAudio = useCallback(async (
        file: File,
        metadata: Omit<WatermarkMetadata, 'timestamp'>
    ) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await audioWatermarkService.uploadAudio(file, metadata);
            setState({
                loading: false,
                error: null,
                data: response
            });
        } catch (error) {
            setState({
                loading: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred',
                data: null
            });
        }
    }, []);

    /**
     * Extracts watermark from an audio file
     */
    const extractWatermark = useCallback(async (file: File) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await audioWatermarkService.extractWatermark(file);
            setState({
                loading: false,
                error: null,
                data: response
            });
        } catch (error) {
            setState({
                loading: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred',
                data: null
            });
        }
    }, []);

    /**
     * Verifies watermark in an audio file
     */
    const verifyWatermark = useCallback(async (
        file: File,
        originalHash: string,
        verificationCode: string
    ) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await audioWatermarkService.verifyWatermark(file, originalHash, verificationCode);
            setState({
                loading: false,
                error: null,
                data: response
            });
        } catch (error) {
            setState({
                loading: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred',
                data: null
            });
        }
    }, []);

    return {
        loading: state.loading,
        error: state.error,
        data: state.data,
        uploadAudio,
        extractWatermark,
        verifyWatermark,
        reset
    };
};
