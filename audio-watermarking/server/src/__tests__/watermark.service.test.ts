import { WatermarkService } from '../services/watermark.service';
import { CryptoUtil } from '../utils/crypto.util';

// Use the mock implementation from __mocks__ directory
jest.mock('steganography.js');

// Mock the crypto util
jest.mock('../utils/crypto.util', () => {
  return {
    CryptoUtil: {
      generateWatermarkHash: jest.fn().mockImplementation((audioData, timestamp) => {
        return `mock-hash-${audioData}-${timestamp}`;
      }),
      encryptWatermark: jest.fn().mockImplementation((watermarkData, key) => {
        return `encrypted-${watermarkData}-with-${key}`;
      }),
      decryptWatermark: jest.fn().mockImplementation((encryptedData, key) => {
        // For testing, return a mock JSON string that can be parsed
        return JSON.stringify({
          hash: 'mock-hash-test-audio-123456789',
          metadata: {
            timestamp: 123456789,
            creator: 'Test Creator',
            description: 'Test Description'
          }
        });
      }),
      generateVerificationCode: jest.fn().mockImplementation((watermarkHash, metadata) => {
        return `verification-code-for-${watermarkHash}`;
      })
    }
  };
});

describe('WatermarkService', () => {
  let watermarkService: WatermarkService;
  const encryptionKey = 'test-encryption-key';
  const testAudioData = 'test-audio-data';
  const testMetadata = {
    timestamp: 123456789,
    creator: 'Test Creator',
    description: 'Test Description'
  };

  beforeEach(() => {
    watermarkService = new WatermarkService(encryptionKey);
    jest.clearAllMocks();
  });

  describe('embedWatermark', () => {
    it('should successfully embed a watermark', async () => {
      const result = await watermarkService.embedWatermark(testAudioData, testMetadata);

      // Verify the result structure
      expect(result).toHaveProperty('watermarkedAudio');
      expect(result).toHaveProperty('watermarkHash');
      expect(result).toHaveProperty('verificationCode');
      expect(result).toHaveProperty('metadata');

      // Verify the watermarked audio
      expect(result.watermarkedAudio).toBe(`watermarked-${testAudioData}`);

      // Verify the watermark hash
      expect(result.watermarkHash).toBe(`mock-hash-${testAudioData}-${testMetadata.timestamp}`);

      // Verify the verification code
      expect(result.verificationCode).toBe(`verification-code-for-mock-hash-${testAudioData}-${testMetadata.timestamp}`);

      // Verify the metadata
      expect(result.metadata).toEqual(testMetadata);

      // Verify the crypto util was called correctly
      expect(CryptoUtil.generateWatermarkHash).toHaveBeenCalledWith(testAudioData, testMetadata.timestamp);
      expect(CryptoUtil.encryptWatermark).toHaveBeenCalled();
      expect(CryptoUtil.generateVerificationCode).toHaveBeenCalled();
    });

    it('should throw an error when embedding fails', async () => {
      // Mock the steganography encode method to throw an error
      const mockSteganography = require('steganography.js').Steganography.mock.results[0].value;
      mockSteganography.encode.mockImplementationOnce(() => {
        throw new Error('Encoding failed');
      });

      await expect(watermarkService.embedWatermark(testAudioData, testMetadata))
        .rejects.toThrow('Failed to embed watermark: Encoding failed');
    });
  });

  describe('extractWatermark', () => {
    it('should successfully extract a watermark', async () => {
      const watermarkedAudio = `watermarked-${testAudioData}`;
      const result = await watermarkService.extractWatermark(watermarkedAudio);

      // Verify the result structure
      expect(result).toHaveProperty('watermarkHash');
      expect(result).toHaveProperty('metadata');

      // Verify the watermark hash
      expect(result.watermarkHash).toBe('mock-hash-test-audio-123456789');

      // Verify the metadata
      expect(result.metadata).toEqual({
        timestamp: 123456789,
        creator: 'Test Creator',
        description: 'Test Description'
      });

      // Verify the crypto util was called correctly
      expect(CryptoUtil.decryptWatermark).toHaveBeenCalled();
    });

    it('should throw an error when extraction fails', async () => {
      // Mock the steganography decode method to throw an error
      const mockSteganography = require('steganography.js').Steganography.mock.results[0].value;
      mockSteganography.decode.mockImplementationOnce(() => {
        throw new Error('Decoding failed');
      });

      await expect(watermarkService.extractWatermark(`watermarked-${testAudioData}`))
        .rejects.toThrow('Failed to extract watermark: Decoding failed');
    });
  });

  describe('verifyWatermark', () => {
    it('should return true for a valid watermark', async () => {
      const watermarkedAudio = `watermarked-${testAudioData}`;
      const originalHash = 'mock-hash-test-audio-123456789';
      const verificationCode = 'verification-code-for-mock-hash-test-audio-123456789';

      // Mock the generateVerificationCode to return the expected verification code
      (CryptoUtil.generateVerificationCode as jest.Mock).mockReturnValueOnce(verificationCode);

      const result = await watermarkService.verifyWatermark(
        watermarkedAudio,
        originalHash,
        verificationCode
      );

      expect(result).toBe(true);
    });

    it('should return false for an invalid hash', async () => {
      const watermarkedAudio = `watermarked-${testAudioData}`;
      const originalHash = 'wrong-hash';
      const verificationCode = 'verification-code-for-mock-hash-test-audio-123456789';

      const result = await watermarkService.verifyWatermark(
        watermarkedAudio,
        originalHash,
        verificationCode
      );

      expect(result).toBe(false);
    });

    it('should return false for an invalid verification code', async () => {
      const watermarkedAudio = `watermarked-${testAudioData}`;
      const originalHash = 'mock-hash-test-audio-123456789';
      const verificationCode = 'wrong-verification-code';

      // Mock the generateVerificationCode to return a different verification code
      (CryptoUtil.generateVerificationCode as jest.Mock).mockReturnValueOnce('different-verification-code');

      const result = await watermarkService.verifyWatermark(
        watermarkedAudio,
        originalHash,
        verificationCode
      );

      expect(result).toBe(false);
    });

    it('should throw an error when verification fails', async () => {
      // Mock the extractWatermark method to throw an error
      jest.spyOn(watermarkService, 'extractWatermark').mockImplementationOnce(() => {
        throw new Error('Extraction failed');
      });

      await expect(watermarkService.verifyWatermark(
        `watermarked-${testAudioData}`,
        'mock-hash',
        'verification-code'
      )).rejects.toThrow('Failed to verify watermark: Extraction failed');
    });
  });
});
