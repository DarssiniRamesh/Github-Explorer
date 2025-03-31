import { AudioService, AudioProcessingOptions } from '../services/audio.service';
import { FFmpegUtil, AudioMetadata } from '../utils/ffmpeg.util';
import path from 'path';

// Mock the ffmpeg utility
jest.mock('../utils/ffmpeg.util', () => {
  return {
    FFmpegUtil: {
      init: jest.fn().mockResolvedValue(undefined),
      getMetadata: jest.fn().mockImplementation(async (filePath: string): Promise<AudioMetadata> => {
        return {
          duration: 180,
          bitrate: 320,
          channels: 2,
          format: path.extname(filePath).slice(1),
          sampleRate: 44100
        };
      }),
      convertFormat: jest.fn().mockImplementation(async (filePath: string, targetFormat: string): Promise<string> => {
        const baseName = path.basename(filePath, path.extname(filePath));
        return `/tmp/converted-${baseName}.${targetFormat}`;
      }),
      normalizeVolume: jest.fn().mockImplementation(async (filePath: string): Promise<string> => {
        const baseName = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);
        return `/tmp/normalized-${baseName}${ext}`;
      }),
      prepareForWatermarking: jest.fn().mockImplementation(async (filePath: string): Promise<string> => {
        const baseName = path.basename(filePath, path.extname(filePath));
        return `/tmp/prepared-${baseName}.wav`;
      }),
      cleanup: jest.fn().mockResolvedValue(undefined)
    }
  };
});

describe('AudioService', () => {
  const testFilePath = '/path/to/test-audio.mp3';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize the FFmpegUtil', async () => {
      await AudioService.init();
      expect(FFmpegUtil.init).toHaveBeenCalled();
    });
  });

  describe('processAudio', () => {
    it('should process audio with default options', async () => {
      const result = await AudioService.processAudio(testFilePath);

      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('metadata');
      expect(result.filePath).toBe(testFilePath);
      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith(testFilePath);
    });

    it('should convert audio format when targetFormat is specified', async () => {
      const options: AudioProcessingOptions = {
        targetFormat: 'wav'
      };

      const result = await AudioService.processAudio(testFilePath, options);

      expect(FFmpegUtil.convertFormat).toHaveBeenCalledWith(testFilePath, 'wav');
      expect(result.filePath).toBe('/tmp/converted-test-audio.wav');
      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith('/tmp/converted-test-audio.wav');
    });

    it('should normalize audio volume when normalize is true', async () => {
      const options: AudioProcessingOptions = {
        normalize: true
      };

      const result = await AudioService.processAudio(testFilePath, options);

      expect(FFmpegUtil.normalizeVolume).toHaveBeenCalledWith(testFilePath);
      expect(result.filePath).toBe('/tmp/normalized-test-audio.mp3');
      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith('/tmp/normalized-test-audio.mp3');
    });

    it('should apply both format conversion and normalization when both options are specified', async () => {
      const options: AudioProcessingOptions = {
        targetFormat: 'wav',
        normalize: true
      };

      // Mock the convertFormat to return a specific path
      (FFmpegUtil.convertFormat as jest.Mock).mockResolvedValueOnce('/tmp/converted-test-audio.wav');
      
      // Mock the normalizeVolume to return a specific path
      (FFmpegUtil.normalizeVolume as jest.Mock).mockResolvedValueOnce('/tmp/normalized-converted-test-audio.wav');

      const result = await AudioService.processAudio(testFilePath, options);

      expect(FFmpegUtil.convertFormat).toHaveBeenCalledWith(testFilePath, 'wav');
      expect(FFmpegUtil.normalizeVolume).toHaveBeenCalledWith('/tmp/converted-test-audio.wav');
      expect(result.filePath).toBe('/tmp/normalized-converted-test-audio.wav');
      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith('/tmp/normalized-converted-test-audio.wav');
    });

    it('should clean up temporary files when an error occurs', async () => {
      const options: AudioProcessingOptions = {
        targetFormat: 'wav'
      };

      // Mock the convertFormat to return a specific path
      (FFmpegUtil.convertFormat as jest.Mock).mockResolvedValueOnce('/tmp/converted-test-audio.wav');
      
      // Mock the getMetadata to throw an error
      (FFmpegUtil.getMetadata as jest.Mock).mockRejectedValueOnce(new Error('Metadata error'));

      await expect(AudioService.processAudio(testFilePath, options)).rejects.toThrow('Metadata error');
      expect(FFmpegUtil.cleanup).toHaveBeenCalledWith('/tmp/converted-test-audio.wav');
    });
  });

  describe('prepareForWatermarking', () => {
    it('should prepare audio for watermarking', async () => {
      const result = await AudioService.prepareForWatermarking(testFilePath);

      expect(FFmpegUtil.prepareForWatermarking).toHaveBeenCalledWith(testFilePath);
      expect(result.filePath).toBe('/tmp/prepared-test-audio.wav');
      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith('/tmp/prepared-test-audio.wav');
    });

    it('should throw an error when preparation fails', async () => {
      // Mock the prepareForWatermarking to throw an error
      (FFmpegUtil.prepareForWatermarking as jest.Mock).mockRejectedValueOnce(new Error('Preparation error'));

      await expect(AudioService.prepareForWatermarking(testFilePath))
        .rejects.toThrow('Failed to prepare audio for watermarking: Preparation error');
    });
  });

  describe('getMetadata', () => {
    it('should get audio metadata', async () => {
      const result = await AudioService.getMetadata(testFilePath);

      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith(testFilePath);
      expect(result).toEqual({
        duration: 180,
        bitrate: 320,
        channels: 2,
        format: 'mp3',
        sampleRate: 44100
      });
    });

    it('should throw an error when getting metadata fails', async () => {
      // Mock the getMetadata to throw an error
      (FFmpegUtil.getMetadata as jest.Mock).mockRejectedValueOnce(new Error('Metadata error'));

      await expect(AudioService.getMetadata(testFilePath))
        .rejects.toThrow('Failed to get audio metadata: Metadata error');
    });
  });

  describe('convertFormat', () => {
    it('should convert audio format', async () => {
      const result = await AudioService.convertFormat(testFilePath, 'wav');

      expect(FFmpegUtil.convertFormat).toHaveBeenCalledWith(testFilePath, 'wav');
      expect(result.filePath).toBe('/tmp/converted-test-audio.wav');
      expect(FFmpegUtil.getMetadata).toHaveBeenCalledWith('/tmp/converted-test-audio.wav');
    });

    it('should throw an error when conversion fails', async () => {
      // Mock the convertFormat to throw an error
      (FFmpegUtil.convertFormat as jest.Mock).mockRejectedValueOnce(new Error('Conversion error'));

      await expect(AudioService.convertFormat(testFilePath, 'wav'))
        .rejects.toThrow('Failed to convert audio format: Conversion error');
    });
  });

  describe('cleanup', () => {
    it('should clean up temporary files', async () => {
      const filePaths = ['/tmp/file1.mp3', '/tmp/file2.wav'];
      
      await AudioService.cleanup(filePaths);
      
      expect(FFmpegUtil.cleanup).toHaveBeenCalledTimes(2);
      expect(FFmpegUtil.cleanup).toHaveBeenCalledWith('/tmp/file1.mp3');
      expect(FFmpegUtil.cleanup).toHaveBeenCalledWith('/tmp/file2.wav');
    });
  });
});